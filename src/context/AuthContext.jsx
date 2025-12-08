import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [configError, setConfigError] = useState(false);

    useEffect(() => {
        if (!supabase) {
            console.error('Supabase client not initialized. Check Env Vars.');
            setConfigError(true);
            setLoading(false);
            return;
        }

        let mounted = true;

        const checkSession = async () => {
            try {
                // No timeout - let it load naturally in background
                const { data } = await supabase.auth.getSession();

                if (mounted && data?.session?.user) {
                    const profile = await getProfile(data.session.user);
                    if (mounted) {
                        setUser({
                            ...data.session.user,
                            name: profile?.name || data.session.user.email,
                            weeklyHours: profile?.weekly_hours || 40
                        });
                    }
                }
            } catch (err) {
                console.warn("Session check failed:", err.message);
                // App continues to work - user just stays logged out
                if (mounted) setUser(null);
            }
        };

        // Show UI immediately - don't block on session check
        setLoading(false);

        // Load session in background
        checkSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            if (session?.user) {
                const profile = await getProfile(session.user);
                if (mounted) {
                    setUser({
                        ...session.user,
                        name: profile?.name || session.user.email,
                        weeklyHours: profile?.weekly_hours || 40
                    });
                }
            } else {
                setUser(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const getProfile = async (user) => {
        if (!supabase) return null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('name, weekly_hours')
                .eq('id', user.id)
                .single();

            if (error) {
                console.warn('Profile fetch error (ignoring):', error.message);
                return null;
            }
            return data;
        } catch (e) {
            console.error('Profile fetch exception:', e);
            return null;
        }
    };

    const login = async (email, password) => {
        console.log('🔐 [1/6] Login function called for:', email);

        if (!supabase) {
            console.error('❌ [2/6] Supabase not initialized');
            return { success: false, error: { message: 'System not configured' } };
        }

        console.log('✅ [2/6] Supabase client OK');

        try {
            console.log('⏳ [3/6] Calling signInWithPassword...');
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            console.log('⌛ [4/6] signInWithPassword returned');

            if (error) {
                console.error('❌ [5/6] Login error:', error.message, error);
                return { success: false, error };
            }

            if (data?.user) {
                console.log('✅ [5/6] Login successful!');
                console.log('   User:', data.user.email);
                console.log('   Email confirmed at:', data.user.email_confirmed_at);
                console.log('   User ID:', data.user.id);
                return { success: true, error: null };
            }

            console.warn('⚠️ [5/6] No error but no user either', data);
            return { success: false, error: { message: 'No user data returned' } };

        } catch (e) {
            console.error('💥 [EXCEPTION] Login threw an error:', e);
            return { success: false, error: { message: e.message || 'Login failed' } };
        }
    };

    const register = async (name, email, password) => {
        console.log('📝 [1/5] Register function called for:', email);

        if (!supabase) {
            console.error('❌ [2/5] Supabase not initialized');
            return false;
        }

        console.log('✅ [2/5] Supabase client OK');

        try {
            console.log('⏳ [3/5] Calling signUp...');
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });
            console.log('⌛ [4/5] signUp returned');

            if (error) {
                console.error('❌ [5/5] Registration error:', error.message, error);
                return false;
            }

            console.log('✅ [5/5] Registration successful!');
            console.log('   User:', data.user?.email);
            console.log('   Session:', data.session ? 'Created' : 'null (email confirmation required)');

            // If email confirmation is enabled, data.session might be null even if successful.
            // We consider it a success so the UI can redirect or show a message.
            return true;

        } catch (e) {
            console.error('💥 [EXCEPTION] Registration threw an error:', e);
            return false;
        }
    };

    const logout = async () => {
        console.log('🚪 [1/3] Logout function called');
        if (!supabase) {
            console.error('❌ [2/3] Supabase not initialized');
            return;
        }
        console.log('⏳ [2/3] Calling signOut...');
        await supabase.auth.signOut();
        console.log('✅ [3/3] SignOut successful, clearing user state');
        setUser(null);
    };

    const resetPassword = async (email) => {
        if (!supabase) return { success: false, error: { message: 'System not configured' } };
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        return { success: !error, error };
    };

    const updateWeeklyHours = async (hours) => {
        if (!supabase || !user) return { success: false, error: { message: 'Not authenticated' } };

        // Validate hours (1-168 hours per week)
        if (hours < 1 || hours > 168) {
            return { success: false, error: { message: 'Hours must be between 1 and 168' } };
        }

        const { error } = await supabase
            .from('profiles')
            .update({ weekly_hours: hours })
            .eq('id', user.id);

        if (!error) {
            // Update local user state
            setUser({ ...user, weeklyHours: hours });
        }

        return { success: !error, error };
    };


    if (configError) {
        return (
            <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
                <h1>Configuration Error</h1>
                <p>Missing Supabase Credentials.</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Render.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                fontSize: '1.5rem',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                zIndex: 9999
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '1rem' }}>Loading application...</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Checking authentication status</div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, resetPassword, updateWeeklyHours, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

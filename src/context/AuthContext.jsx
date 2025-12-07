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

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Fetch profile to get the name
                getProfile(session.user).then(profile => {
                    setUser({ ...session.user, name: profile?.name || session.user.email });
                });
            } else {
                setUser(null);
            }
        }).catch(err => {
            console.error("Session check failed:", err);
            setUser(null);
        }).finally(() => {
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await getProfile(session.user);
                setUser({ ...session.user, name: profile?.name || session.user.email });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const getProfile = async (user) => {
        if (!supabase) return null;
        const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
        return data;
    };

    const login = async (email, password) => {
        if (!supabase) return { success: false, error: { message: 'System not configured' } };
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { success: !error, error };
    };

    const register = async (name, email, password) => {
        if (!supabase) return false;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });

        if (error) {
            console.error('Registration error:', error.message);
            return false;
        }

        // If email confirmation is enabled, data.session might be null even if successful.
        // We consider it a success so the UI can redirect or show a message.
        return true;
    };

    const logout = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        setUser(null);
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
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

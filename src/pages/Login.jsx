import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { success, error: authError } = await login(email, password);
        if (success) {
            navigate('/');
        } else {
            setError(authError?.message || 'Invalid email or password');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setResetMessage('');
        const { success, error: resetError } = await resetPassword(resetEmail);
        if (success) {
            setResetMessage('✅ Check your email for the password reset link!');
            setTimeout(() => setShowForgotModal(false), 3000);
        } else {
            setResetMessage('❌ ' + (resetError?.message || 'Failed to send reset email'));
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
        }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Welcome to Work</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Sign in to track your hours</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="input-group" style={{ position: 'relative' }}>
                        <label>Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{ paddingRight: '2.5rem' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '0.75rem',
                                top: '2.25rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                padding: '0.25rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForgotModal(true);
                                setResetEmail(email);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        <LogIn size={18} />
                        Sign In
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register</Link>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Reset Password</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Enter your email and we'll send you a link to reset your password.
                        </p>

                        {resetMessage && (
                            <div style={{
                                backgroundColor: resetMessage.startsWith('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: resetMessage.startsWith('✅') ? '#22c55e' : 'var(--danger)',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1rem',
                                fontSize: '0.875rem'
                            }}>
                                {resetMessage}
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword}>
                            <div className="input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    autoFocus
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(false)}
                                    className="btn"
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    Send Reset Link
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

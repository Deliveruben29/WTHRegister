import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.8)', // Dark background to ensure text visibility
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

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  // Load saved theme
  useEffect(() => {
    const savedColor = localStorage.getItem('theme-primary');
    if (savedColor) {
      document.documentElement.style.setProperty('--primary', savedColor);
      // We should also calculate hover variant roughly or just let it be simpler for now
      // ideally we'd have a function to darken the color for hover.
      // For this MVP, we might accept hover might not be perfect or we set it too.
    }
  }, []);

  console.log('App component rendering');
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

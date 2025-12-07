import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading authentication...
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
  );
}

export default App;

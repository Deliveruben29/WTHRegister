import { createContext, useState, useContext, useEffect } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = storage.getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const user = storage.login(email, password);
        if (user) {
            setUser(user);
            return true;
        }
        return false;
    };

    const register = (name, email, password) => {
        if (storage.findUser(email)) {
            return false; // User exists
        }
        const newUser = { id: Date.now().toString(), name, email, password };
        storage.saveUser(newUser);
        return true;
    };

    const logout = () => {
        storage.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

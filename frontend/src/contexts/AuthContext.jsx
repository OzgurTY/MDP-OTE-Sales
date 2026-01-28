import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage on init
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { token, user } = response.data;

            // Store session
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Update axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setCurrentUser(user);
            return user;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            await axios.post('/api/auth/register', { name, email, password });
            // Optionally auto-login after register, or require separate login
            // For now, let's just return true
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
    };

    const updateProfile = (updates) => {
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

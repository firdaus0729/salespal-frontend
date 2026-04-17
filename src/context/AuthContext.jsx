import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api, { getAccessToken, setTokens, clearTokens } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getAccessToken();

        if (token) {
            api.get('/users/me')
                .then(data => {
                    setUser(data.user || data);
                    setIsAuthenticated(true);
                    setSession({ access_token: token });
                })
                .catch(() => {
                    clearTokens();
                    setUser(null);
                    setIsAuthenticated(false);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const refreshUser = async () => {
        try {
            const data = await api.get('/users/me');
            setUser(data.user || data);
        } catch (e) {
            // silently ignore
        }
    };

    const login = async (email, password) => {
        try {
            const data = await api.post('/auth/login', { email, password });
            setTokens(data.accessToken, data.refreshToken);
            setUser(data.user);
            setSession({ access_token: data.accessToken });
            setIsAuthenticated(true);
            return { success: true, user: data.user };
        } catch (error) {
            throw { message: error.message || 'Login failed' };
        }
    };

    const loginWithGoogle = async (credential) => {
        try {
            const data = await api.post('/auth/google', { token: credential });
            setTokens(data.accessToken, data.refreshToken);
            setUser(data.user);
            setSession({ access_token: data.accessToken });
            setIsAuthenticated(true);
            return { success: true, user: data.user };
        } catch (error) {
            throw { message: error.message || 'Google login failed' };
        }
    };

    const signup = async (email, password, fullName) => {
        try {
            const data = await api.post('/auth/register', { email, password, fullName });
            // Email verification is required. Do not log in automatically.
            return { success: true, message: data.message };
        } catch (error) {
            throw { message: error.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            // Optional: call backend to invalidate refresh token if supported
            await api.post('/auth/logout');
        } catch(e) {
            // ignore
        }
        clearTokens();
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
    };

    const value = useMemo(() => ({
        isAuthenticated,
        user,
        session,
        login,
        loginWithGoogle,
        signup,
        logout,
        loading,
        refreshUser,
    }), [isAuthenticated, user, session, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

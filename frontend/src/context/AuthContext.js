import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // We now initialize state by checking for a token in localStorage
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (token && username) {
            return { token, username };
        }
        return null;
    });

    // The login function now expects an object with token and username
    const login = (userData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('username', userData.username);
        setUser({ token: userData.token, username: userData.username });
    };

    // The logout function now clears the token and username
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
    };

    const value = { user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
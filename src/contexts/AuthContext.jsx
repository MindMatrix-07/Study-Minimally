import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { setAccessToken as setServiceToken } from '../services/youtube';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Lazy initialization from localStorage to prevent refresh flicker
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user_profile');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [accessToken, setAccessToken] = useState(() => {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) setServiceToken(storedToken); // Ensure service has token immediately
        return storedToken || null;
    });
    const [isLoading, setIsLoading] = useState(false);

    // Login function
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            const token = codeResponse.access_token;
            setAccessToken(token);
            setServiceToken(token); // UPDATE SERVICE
            fetchUserProfile(token);
        },
        onError: (error) => console.log('Login Failed:', error),
        scope: 'https://www.googleapis.com/auth/youtube.readonly'
    });

    // Fetch user profile from Google
    const fetchUserProfile = async (token) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });
            setUser(res.data);
            localStorage.setItem('user_profile', JSON.stringify(res.data));
            localStorage.setItem('access_token', token);
        } catch (err) {
            console.error("Failed to fetch user profile", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logOut = () => {
        googleLogout();
        setUser(null);
        setAccessToken(null);
        setServiceToken(null); // CLEAR SERVICE
        localStorage.removeItem('user_profile');
        localStorage.removeItem('access_token');
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Login function
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            setAccessToken(codeResponse.access_token);
            fetchUserProfile(codeResponse.access_token);
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
        localStorage.removeItem('user_profile');
        localStorage.removeItem('access_token');
    };

    // Restore session on load
    useEffect(() => {
        const storedUser = localStorage.getItem('user_profile');
        const storedToken = localStorage.getItem('access_token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setAccessToken(storedToken);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

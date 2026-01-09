import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { setAccessToken as setServiceToken } from '../services/youtube';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Lazy initialization from localStorage to prevent refresh flicker
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user_profile');
        const storedExpiry = localStorage.getItem('token_expiry');
        
        // Check if token is expired
        if (storedExpiry && Date.now() > parseInt(storedExpiry)) {
            localStorage.removeItem('user_profile');
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_expiry');
            return null;
        }
        
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [accessToken, setAccessToken] = useState(() => {
        const storedToken = localStorage.getItem('access_token');
        const storedExpiry = localStorage.getItem('token_expiry');

        // Check if token is expired
        if (storedExpiry && Date.now() > parseInt(storedExpiry)) {
            return null;
        }

        if (storedToken) setServiceToken(storedToken); // Ensure service has token immediately
        return storedToken || null;
    });
    const [isLoading, setIsLoading] = useState(false);

    // Login function
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            const token = codeResponse.access_token;
            // Calculate expiry (expires_in is in seconds, usually 3599)
            const expiresIn = codeResponse.expires_in || 3599; 
            const expiryTime = Date.now() + (expiresIn * 1000); 
            
            setAccessToken(token);
            setServiceToken(token); // UPDATE SERVICE
            
            localStorage.setItem('access_token', token);
            localStorage.setItem('token_expiry', expiryTime.toString());
            
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
            // Note: Token and expiry are already set in login onSuccess to ensure they are available
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
        localStorage.removeItem('token_expiry');
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

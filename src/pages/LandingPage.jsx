import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaYoutube } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

const LandingPage = () => {
    const { login, isLoading } = useAuth();

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
                    <FaYoutube size={64} color="#38bdf8" />
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 16px 0', background: 'linear-gradient(to right, #f1f5f9, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Study-Minimally
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '500px', lineHeight: '1.6' }}>
                    A minimal, distraction-free environment for focused learning.
                    Log in with Google to access your curated feed.
                </p>
            </div>

            <button
                onClick={() => login()}
                disabled={isLoading}
                style={{
                    background: 'white',
                    color: '#0f172a',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '50px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    minWidth: '250px',
                    justifyContent: 'center'
                }}
            >
                <FcGoogle size={24} />
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
        </div>
    );
};

export default LandingPage;

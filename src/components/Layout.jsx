import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { FaYoutube, FaSearch, FaSignOutAlt, FaHistory } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import QuoteWidget from './QuoteWidget';

const Layout = ({ children }) => {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?q=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate('/');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(16px)',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '0 24px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <FaYoutube color="#38bdf8" size={28} />
                        <span style={{
                            background: 'linear-gradient(to right, #f1f5f9, #94a3b8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.5px'
                        }}>
                            Study-Minimally
                        </span>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '500px', margin: '0 32px' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '50px',
                                    padding: '10px 20px 10px 40px',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                            />
                            <FaSearch style={{ position: 'absolute', left: '16px', color: '#64748b' }} />
                        </div>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <NavLink
                            to="/"
                            style={({ isActive }) => ({
                                color: isActive ? '#38bdf8' : '#94a3b8',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                transition: 'color 0.2s'
                            })}
                        >
                            Feed
                        </NavLink>
                        {/* History Link - To be implemented */}
                        <NavLink
                            to="/history"
                            style={({ isActive }) => ({
                                color: isActive ? '#38bdf8' : '#94a3b8',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                transition: 'color 0.2s'
                            })}
                        >
                            History
                        </NavLink>
                        <NavLink
                            to="/analytics"
                            style={({ isActive }) => ({
                                color: isActive ? '#38bdf8' : '#94a3b8',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                transition: 'color 0.2s'
                            })}
                        >
                            Analytics
                        </NavLink>

                        {/* User Profile */}
                        {user && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(56, 189, 248, 0.3)' }}
                                    title={user.name}
                                />
                                <button
                                    onClick={logOut}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    title="Sign Out"
                                >
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
                <QuoteWidget />
                {children}
            </main>
        </div>
    );
};

export default Layout;

import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { FaYoutube, FaSearch, FaSignOutAlt, FaHistory, FaMoon, FaSun, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import QuoteWidget from './QuoteWidget';

const Layout = ({ children }) => {
    const { user, logOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?q=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate('/');
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.3s, color 0.3s' }}>
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(16px)',
                backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                borderBottom: '1px solid var(--border-color)',
                padding: '0 24px',
                transition: 'background-color 0.3s'
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
                                    background: 'var(--bg-secondary)', // Use variable
                                    border: '1px solid var(--border-color)', // Use variable
                                    borderRadius: '50px',
                                    padding: '10px 20px 10px 40px',
                                    color: 'var(--text-primary)', // Use variable
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
                                }}
                            />
                            <FaSearch style={{ position: 'absolute', left: '16px', color: 'var(--text-secondary)' }} />
                        </div>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <NavLink
                            to="/"
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                transition: 'color 0.2s'
                            })}
                        >
                            Feed
                        </NavLink>
                        <NavLink
                            to="/history"
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
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
                                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                transition: 'color 0.2s'
                            })}
                        >
                            Analytics
                        </NavLink>

                        {/* User Profile Dropdown */}
                        {user && (
                            <div style={{ position: 'relative', marginLeft: '12px' }} ref={dropdownRef}>
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        border: '2px solid rgba(56, 189, 248, 0.3)', cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                    title={user.name}
                                />

                                {isDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '48px',
                                        right: '0',
                                        width: '220px',
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                        padding: '8px',
                                        zIndex: 1000,
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                                            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>{user.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                        </div>

                                        <button
                                            onClick={() => { toggleTheme(); setIsDropdownOpen(false); }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                width: '100%', padding: '10px 16px',
                                                background: 'transparent', border: 'none',
                                                color: 'var(--text-primary)', cursor: 'pointer',
                                                fontSize: '14px', textAlign: 'left',
                                                borderRadius: '8px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            {theme === 'dark' ? <FaSun color="#fbbf24" /> : <FaMoon color="#64748b" />}
                                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                        </button>

                                        <button
                                            onClick={logOut}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                width: '100%', padding: '10px 16px',
                                                background: 'transparent', border: 'none',
                                                color: '#ef4444', cursor: 'pointer',
                                                fontSize: '14px', textAlign: 'left',
                                                borderRadius: '8px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <FaSignOutAlt /> Sign Out
                                        </button>
                                    </div>
                                )}
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

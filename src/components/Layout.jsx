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
    const [lastWatched, setLastWatched] = useState(null);

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

    // Continue Watching Logic
    useEffect(() => {
        const checkLastWatched = () => {
            const stored = localStorage.getItem('last_watched_video');
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    // Only show if < 24 hours old and we are NOT on the watch page for that video
                    if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000 &&
                        !window.location.pathname.includes(data.id)) {
                        setLastWatched(data);

                        // Hide after 10 seconds
                        setTimeout(() => {
                            setLastWatched(null);
                        }, 10000);
                    }
                } catch (e) {
                    console.error("Corrupt history data", e);
                    localStorage.removeItem('last_watched_video');
                }
            }
        };

        // Check on mount
        checkLastWatched();

        // Optional: Listen for route changes to re-check (if user navigates back to feed)
    }, [window.location.pathname]); // Simple dependency on path change

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.3s, color 0.3s' }}>
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(16px)',
                backgroundColor: 'var(--nav-bg)', // Use CSS variable
                borderBottom: '1px solid var(--border-color)',
                padding: '0 24px',
                transition: 'background-color 0.3s'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <FaYoutube color="var(--accent)" size={28} />
                        <span style={{
                            background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.5px'
                        }}>
                            Study-Minimally.
                        </span>
                    </div>

                    {/* Search Bar - Hidden on very small mobile if needed, or styled better */}
                    <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '500px', margin: '0 32px', display: window.innerWidth < 600 ? 'none' : 'block' }}>
                        {/* Note: In a real app we'd use CSS module or media query for display:none, checking window.innerWidth here is just a quick patch for the structure. Better to leave it flexible or use className. Let's stick to style but allow shrinking. */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '50px',
                                    padding: '10px 20px 10px 40px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
                                }}
                            />
                            <FaSearch style={{ position: 'absolute', left: '16px', color: 'var(--text-secondary)' }} />
                        </div>
                    </form>
                    {/* Search Icon for Mobile (Simple prompt) */}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div className="desktop-links" style={{ display: 'flex', gap: '24px' }}>
                            {/* Add css class later for mobile hiding if needed */}
                            <NavLink to="/" style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' })}>Feed</NavLink>
                            <NavLink to="/history" style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' })}>History</NavLink>
                            <NavLink to="/analytics" style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' })}>Analytics</NavLink>
                        </div>

                        {/* User Profile Dropdown */}
                        {user && (
                            <div style={{ position: 'relative', marginLeft: '12px' }} ref={dropdownRef}>
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        border: '2px solid var(--border-color)', cursor: 'pointer', // Changed border color
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
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)', // Increased shadow
                                        padding: '8px',
                                        zIndex: 1000,
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                                            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>{user.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                        </div>

                                        <button
                                            onClick={() => { toggleTheme(); }}
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
                                            {theme === 'light' ? <FaSun color="#fbbf24" /> : theme === 'dark' ? <FaMoon color="#64748b" /> : <FaMoon color="white" />}
                                            {theme === 'light' ? 'Light Mode' : theme === 'dark' ? 'Dark Mode' : 'AMOLED Mode'}
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

            {/* Continue Watching Floating Button */}
            {lastWatched && (
                <div style={{
                    position: 'fixed',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--surface-card)', // Assuming variable or fallback
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--accent)',
                    borderRadius: '50px',
                    padding: '12px 24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'slideUp 0.5s ease-out'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Continue Watching</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lastWatched.title}</span>
                    </div>
                    <button
                        onClick={() => navigate(`/watch/${lastWatched.id}`)}
                        style={{
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <FaPlay size={10} />
                    </button>
                    <button
                        onClick={() => setLastWatched(null)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '4px' }}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default Layout;

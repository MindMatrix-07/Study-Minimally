import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaYoutube, FaChartLine } from 'react-icons/fa';

import QuoteWidget from './QuoteWidget';

const Layout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(16px)',
                backgroundColor: 'rgba(15, 23, 42, 0.85)', /* Matched to new theme */
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '0 24px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 'bold' }}>
                        <FaYoutube color="#38bdf8" size={28} /> {/* Calming blue icon */}
                        <span style={{
                            background: 'linear-gradient(to right, #f1f5f9, #94a3b8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.5px'
                        }}>
                            Study Space
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '32px' }}>
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

import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaYoutube, FaChartLine } from 'react-icons/fa';

const Layout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(12px)',
                backgroundColor: 'rgba(15, 15, 17, 0.8)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '0 24px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 'bold' }}>
                        <FaYoutube color="#ff0000" size={28} />
                        <span style={{ background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Study-Minimally
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <NavLink
                            to="/"
                            style={({ isActive }) => ({
                                color: isActive ? 'white' : '#a1a1aa',
                                textDecoration: 'none',
                                fontWeight: 500
                            })}
                        >
                            Feed
                        </NavLink>
                        <NavLink
                            to="/analytics"
                            style={({ isActive }) => ({
                                color: isActive ? 'white' : '#a1a1aa',
                                textDecoration: 'none',
                                fontWeight: 500
                            })}
                        >
                            Analytics
                        </NavLink>
                    </div>
                </div>
            </nav>
            <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '24px' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;

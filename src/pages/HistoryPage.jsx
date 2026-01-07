import React, { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../services/history';
import VideoCard from '../components/VideoCard';
import { FaTrash, FaHistory } from 'react-icons/fa';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear your watch history?')) {
            clearHistory();
            setHistory([]);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaHistory color="#38bdf8" />
                    Watch History
                </h1>
                {history.length > 0 && (
                    <button
                        onClick={handleClear}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 99, 71, 0.5)',
                            color: '#ff6b6b',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background 0.2s, color 0.2s'
                        }}
                    >
                        <FaTrash /> Clear History
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <FaHistory size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No watch history yet. Start watching videos!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {history.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;

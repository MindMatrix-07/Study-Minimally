import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHANNELS, fetchChannelVideos, fetchLiveStreams } from '../services/youtube';
import VideoCard from '../components/VideoCard';

const Feed = () => {
    const [activeChannel, setActiveChannel] = useState('ALL');
    const [activeTab, setActiveTab] = useState('ALL_CONTENT'); // ALL_CONTENT, VIDEOS, LIVE
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadContent = async () => {
            setLoading(true);
            let allVideos = [];

            const channelsToFetch = activeChannel === 'ALL'
                ? Object.values(CHANNELS)
                : Object.values(CHANNELS).filter(c => c.name === activeChannel);

            try {
                const promises = channelsToFetch.map(async (channel) => {
                    let results = [];

                    if (activeTab === 'LIVE' || activeTab === 'ALL_CONTENT') {
                        const live = await fetchLiveStreams(channel.id);
                        results = [...results, ...live];
                    }

                    if (activeTab === 'VIDEOS' || activeTab === 'ALL_CONTENT') {
                        const uploads = await fetchChannelVideos(channel.id, 12);
                        results = [...results, ...uploads];
                    }

                    return results;
                });

                const results = await Promise.all(promises);
                allVideos = results.flat().sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

                // Remove duplicates
                const seen = new Set();
                allVideos = allVideos.filter(v => {
                    if (seen.has(v.id)) return false;
                    seen.add(v.id);
                    return true;
                });

            } catch (err) {
                console.error("Failed to load videos", err);
            } finally {
                setVideos(allVideos);
                setLoading(false);
            }
        };

        loadContent();
    }, [activeChannel, activeTab]);

    return (
        <div>
            {/* Mobile Design: Stacked filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {/* Channel Filters */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="scrollbar-hide">
                    <FilterButton
                        active={activeChannel === 'ALL'}
                        onClick={() => setActiveChannel('ALL')}
                        label="All Channels"
                    />
                    <FilterButton
                        active={activeChannel === CHANNELS.PW_JEE.name}
                        onClick={() => setActiveChannel(CHANNELS.PW_JEE.name)}
                        label="Physics Wallah JEE"
                    />
                    <FilterButton
                        active={activeChannel === CHANNELS.XYLEM.name}
                        onClick={() => setActiveChannel(CHANNELS.XYLEM.name)}
                        label="Xylem JEE"
                    />
                </div>

                {/* Content Type Tabs */}
                <div style={{ borderBottom: '1px solid #333', display: 'flex', gap: '24px' }}>
                    <TabButton
                        active={activeTab === 'ALL_CONTENT'}
                        onClick={() => setActiveTab('ALL_CONTENT')}
                        label="Home"
                    />
                    <TabButton
                        active={activeTab === 'VIDEOS'}
                        onClick={() => setActiveTab('VIDEOS')}
                        label="Videos"
                    />
                    <TabButton
                        active={activeTab === 'LIVE'}
                        onClick={() => setActiveTab('LIVE')}
                        label="Live"
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>Loading content...</div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px',
                    // Mobile adjustment
                    '@media (max-width: 600px)': {
                        gridTemplateColumns: '1fr'
                    }
                }}>
                    {videos.map(video => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            onClick={() => navigate(`/watch/${video.id}`)}
                        />
                    ))}
                    {videos.length === 0 && !loading && (
                        <div style={{ color: '#555', gridColumn: '1 / -1', textAlign: 'center' }}>No videos found for this filter.</div>
                    )}
                </div>
            )}
        </div>
    );
};

// Sub-components
const FilterButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: active ? '1px solid #646cff' : '1px solid #333',
            background: active ? '#646cff22' : 'transparent',
            color: active ? '#646cff' : '#a1a1aa',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            flexShrink: 0
        }}
    >
        {label}
    </button>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        style={{
            background: 'transparent',
            border: 'none',
            borderBottom: active ? '2px solid #646cff' : '2px solid transparent',
            color: active ? 'white' : '#71717a',
            padding: '8px 4px',
            cursor: 'pointer',
            fontWeight: active ? '600' : '400',
            fontSize: '15px'
        }}
    >
        {label}
    </button>
);

export default Feed;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHANNELS, fetchChannelVideos, fetchLiveArchives, fetchActiveLive } from '../services/youtube';
import VideoCard from '../components/VideoCard';

const Feed = () => {
    const [activeChannel, setActiveChannel] = useState('ALL');
    const [activeTab, setActiveTab] = useState('ALL_CONTENT'); // ALL_CONTENT, VIDEOS, LIVE

    const [videos, setVideos] = useState([]);
    const [pageToken, setPageToken] = useState(null); // Token for the next page
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const navigate = useNavigate();

    // Helper to determine which channels to query
    const getTargetChannels = useCallback(() => {
        return activeChannel === 'ALL'
            ? Object.values(CHANNELS)
            : Object.values(CHANNELS).filter(c => c.name === activeChannel);
    }, [activeChannel]);

    // Initial Data Load (Reset)
    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            setVideos([]);
            setPageToken(null);

            const channels = getTargetChannels();
            let combinedItems = [];
            let nextTokens = {}; // Store tokens per channel if needed, for simplicity we might just grab the first valid one or parallel fetch

            try {
                const promises = channels.map(async (channel) => {
                    let results = [];

                    // Fetch Logic based on Tab
                    if (activeTab === 'LIVE') {
                        // 1. Get Active Live (Always show these at top)
                        const active = await fetchActiveLive(channel.id);
                        // 2. Get Past Live (Archives)
                        const { items: past, nextPageToken } = await fetchLiveArchives(channel.id);
                        results = [...active, ...past];

                        // We only handle pagination for single channel roughly or complex merge
                        return { items: results, token: nextPageToken };
                    } else {
                        // VIDEOS or ALL (Defaulting 'ALL' to just Videos stream for now to keep it clean, or mix?)
                        // The user wants "Video Section" and "Live Section". 
                        // Let's treat 'ALL_CONTENT' as 'VIDEOS' for pagination simplicity, or just mix.
                        // Defaulting ALL -> Videos + maybe show separate Live section? 
                        // Simplified: ALL_CONTENT = Videos Tab logic (Standard uploads)

                        const { items, nextPageToken } = await fetchChannelVideos(channel.id);
                        return { items, token: nextPageToken };
                    }
                });

                const responses = await Promise.all(promises);

                // Merge
                responses.forEach(r => {
                    combinedItems = [...combinedItems, ...r.items];
                });

                // Store one of the tokens for pagination (Naive implementation for multi-channel: just uses the first channel's token if single channel selected. 
                // Real multi-channel pagination is complex; we will disable specific "Load More" for 'ALL' channels if it gets too messy, 
                // OR just save the tokens map. For this scope, we'll try to support it if single channel, otherwise just first page.)
                if (channels.length === 1) {
                    setPageToken(responses[0].token);
                } else {
                    setPageToken(null); // Disable pagination for 'All Channels' view to prevent complexity or API chaos
                }

                // Sort by date
                combinedItems.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

                setVideos(combinedItems);
            } catch (err) {
                console.error("Failed to load content", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitial();
    }, [activeChannel, activeTab, getTargetChannels]);

    // Load More Handler
    const handleLoadMore = async () => {
        if (!pageToken || loadingMore) return;
        setLoadingMore(true);

        const channels = getTargetChannels();
        // Only support single channel pagination reliably for now
        const channel = channels[0];

        try {
            let newItems = [];
            let newToken = null;

            if (activeTab === 'LIVE') {
                const result = await fetchLiveArchives(channel.id, pageToken);
                newItems = result.items;
                newToken = result.nextPageToken;
            } else {
                const result = await fetchChannelVideos(channel.id, pageToken);
                newItems = result.items;
                newToken = result.nextPageToken;
            }

            setVideos(prev => [...prev, ...newItems]);
            setPageToken(newToken);
        } catch (err) {
            console.error("Failed to load more", err);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div style={{ paddingBottom: '40px' }}>
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
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '24px',
                        '@media (max-width: 600px)': { gridTemplateColumns: '1fr' }
                    }}>
                        {videos.map(video => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                onClick={() => navigate(`/watch/${video.id}`)}
                            />
                        ))}
                    </div>

                    {/* Load More Button - Only shows if we have a token (Single Channel Mode mostly) */}
                    {pageToken && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                style={{
                                    background: '#2a2a35',
                                    border: '1px solid #3f3f46',
                                    color: 'white',
                                    padding: '12px 32px',
                                    borderRadius: '24px',
                                    cursor: loadingMore ? 'wait' : 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}

                    {!pageToken && activeChannel !== 'ALL' && videos.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '40px', color: '#555' }}>
                            You've reached the end.
                        </div>
                    )}
                </>
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
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: active ? '600' : '400',
            fontSize: '15px'
        }}
    >
        {label}
    </button>
);

export default Feed;

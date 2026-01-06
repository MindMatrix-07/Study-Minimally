import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHANNELS, fetchChannelVideos, fetchLiveArchives, fetchActiveLive, fetchChannelPlaylists } from '../services/youtube';
import VideoCard from '../components/VideoCard';
import PlaylistCard from '../components/PlaylistCard';

const Feed = () => {
    const [activeChannel, setActiveChannel] = useState('ALL');
    const [activeTab, setActiveTab] = useState('ALL_CONTENT'); // ALL_CONTENT, VIDEOS, LIVE, PLAYLISTS

    const [items, setItems] = useState([]);
    const [pageToken, setPageToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const navigate = useNavigate();

    const getTargetChannels = useCallback(() => {
        return activeChannel === 'ALL'
            ? Object.values(CHANNELS)
            : Object.values(CHANNELS).filter(c => c.name === activeChannel);
    }, [activeChannel]);

    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            setItems([]);
            setPageToken(null);

            const channels = getTargetChannels();
            let combinedItems = [];

            try {
                const promises = channels.map(async (channel) => {
                    // LIVE TAB 
                    if (activeTab === 'LIVE') {
                        const active = await fetchActiveLive(channel.id);
                        const { items: past, nextPageToken } = await fetchLiveArchives(channel.id);
                        return { items: [...active, ...past], token: nextPageToken };
                    }
                    // PLAYLISTS TAB
                    else if (activeTab === 'PLAYLISTS') {
                        const { items, nextPageToken } = await fetchChannelPlaylists(channel.id);
                        return { items, token: nextPageToken };
                    }
                    // VIDEOS TAB (or ALL_CONTENT default)
                    else {
                        const { items, nextPageToken } = await fetchChannelVideos(channel.id);
                        return { items, token: nextPageToken };
                    }
                });

                const responses = await Promise.all(promises);
                responses.forEach(r => combinedItems = [...combinedItems, ...r.items]);

                if (channels.length === 1) setPageToken(responses[0].token);
                else setPageToken(null);

                // Sort by date only if NOT playlists (playlists don't always have publishedAt in a useful way for sorting mixed content)
                if (activeTab !== 'PLAYLISTS') {
                    combinedItems.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
                }

                setItems(combinedItems);
            } catch (err) {
                console.error("Failed to load content", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitial();
    }, [activeChannel, activeTab, getTargetChannels]);

    const handleLoadMore = async () => {
        if (!pageToken || loadingMore) return;
        setLoadingMore(true);
        const channels = getTargetChannels();
        const channel = channels[0];

        try {
            let newResult = { items: [], nextPageToken: null };

            if (activeTab === 'LIVE') newResult = await fetchLiveArchives(channel.id, pageToken);
            else if (activeTab === 'PLAYLISTS') newResult = await fetchChannelPlaylists(channel.id, pageToken);
            else newResult = await fetchChannelVideos(channel.id, pageToken);

            setItems(prev => [...prev, ...newResult.items]);
            setPageToken(newResult.nextPageToken);
        } catch (err) { console.error("Failed to load more", err); }
        finally { setLoadingMore(false); }
    };

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {/* Channel Filters */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="scrollbar-hide">
                    <FilterButton active={activeChannel === 'ALL'} onClick={() => setActiveChannel('ALL')} label="All Channels" />
                    <FilterButton active={activeChannel === CHANNELS.PW_JEE.name} onClick={() => setActiveChannel(CHANNELS.PW_JEE.name)} label="Physics Wallah JEE" />
                    <FilterButton active={activeChannel === CHANNELS.XYLEM.name} onClick={() => setActiveChannel(CHANNELS.XYLEM.name)} label="Xylem JEE" />
                </div>

                {/* Content Type Tabs */}
                <div style={{ borderBottom: '1px solid #333', display: 'flex', gap: '24px', overflowX: 'auto' }}>
                    <TabButton active={activeTab === 'ALL_CONTENT'} onClick={() => setActiveTab('ALL_CONTENT')} label="Videos" />
                    <TabButton active={activeTab === 'LIVE'} onClick={() => setActiveTab('LIVE')} label="Live" />
                    <TabButton active={activeTab === 'PLAYLISTS'} onClick={() => setActiveTab('PLAYLISTS')} label="Playlists" />
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
                        {items.map(item => {
                            if (item.kind === 'playlist') {
                                return <PlaylistCard key={item.id} playlist={item} onClick={() => navigate(`/playlist/${item.id}`)} />;
                            } else {
                                return <VideoCard key={item.id} video={item} onClick={() => navigate(`/watch/${item.id}`)} />;
                            }
                        })}
                    </div>

                    {items.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', color: '#555', marginTop: '40px' }}>No content found.</div>
                    )}

                    {pageToken && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                style={{
                                    background: '#2a2a35', border: '1px solid #3f3f46', color: 'white',
                                    padding: '12px 32px', borderRadius: '24px', cursor: loadingMore ? 'wait' : 'pointer'
                                }}
                            >
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const FilterButton = ({ active, onClick, label }) => (
    <button onClick={onClick} style={{
        padding: '8px 16px', borderRadius: '20px', border: active ? '1px solid #646cff' : '1px solid #333',
        background: active ? '#646cff22' : 'transparent', color: active ? '#646cff' : '#a1a1aa',
        cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0
    }}>{label}</button>
);

const TabButton = ({ active, onClick, label }) => (
    <button onClick={onClick} style={{
        background: 'transparent', border: 'none', borderBottom: active ? '2px solid #646cff' : '2px solid transparent',
        color: active ? 'white' : '#71717a', padding: '8px 12px', cursor: 'pointer', fontWeight: active ? '600' : '400', fontSize: '15px', whiteSpace: 'nowrap'
    }}>{label}</button>
);

export default Feed;

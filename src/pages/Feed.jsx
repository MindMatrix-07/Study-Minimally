import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHANNELS, fetchChannelVideos, fetchLiveArchives, fetchActiveLive, fetchChannelPlaylists } from '../services/youtube';
import VideoCard from '../components/VideoCard';
import PlaylistCard from '../components/PlaylistCard';
import { FaThLarge, FaList } from 'react-icons/fa';

const Feed = () => {
    const [activeChannel, setActiveChannel] = useState('ALL');
    const [activeTab, setActiveTab] = useState('ALL_CONTENT');
    const [viewMode, setViewMode] = useState('grid');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [items, setItems] = useState([]);
    const [pageToken, setPageToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const navigate = useNavigate();

    const getTargetChannels = useCallback(() => {
        return activeChannel === 'ALL' ? Object.values(CHANNELS) : Object.values(CHANNELS).filter(c => c.name === activeChannel);
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
                    if (activeTab === 'LIVE') {
                        const active = await fetchActiveLive(channel.id);
                        const { items: past, nextPageToken } = await fetchLiveArchives(channel.id, '', dateFilter);
                        return { items: [...active, ...past], token: nextPageToken };
                    } else if (activeTab === 'PLAYLISTS') {
                        const { items, nextPageToken } = await fetchChannelPlaylists(channel.id);
                        return { items, token: nextPageToken };
                    } else {
                        const { items, nextPageToken } = await fetchChannelVideos(channel.id, '', dateFilter);
                        return { items, token: nextPageToken };
                    }
                });
                const responses = await Promise.all(promises);
                responses.forEach(r => combinedItems = [...combinedItems, ...r.items]);
                if (channels.length === 1) setPageToken(responses[0].token);
                else setPageToken(null);
                if (activeTab !== 'PLAYLISTS') combinedItems.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
                setItems(combinedItems);
            } catch (err) { console.error("Failed to load content", err); }
            finally { setLoading(false); }
        };
        loadInitial();
    }, [activeChannel, activeTab, dateFilter, getTargetChannels]);

    const handleLoadMore = async () => {
        if (!pageToken || loadingMore) return;
        setLoadingMore(true);
        const channel = getTargetChannels()[0];
        try {
            let newResult = { items: [], nextPageToken: null };
            if (activeTab === 'LIVE') newResult = await fetchLiveArchives(channel.id, pageToken, dateFilter);
            else if (activeTab === 'PLAYLISTS') newResult = await fetchChannelPlaylists(channel.id, pageToken);
            else newResult = await fetchChannelVideos(channel.id, pageToken, dateFilter);
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

                {/* Filters Row */}
                <div className="filters-row">
                    {/* Content Tabs */}
                    <div style={{ display: 'flex', gap: '24px', whiteSpace: 'nowrap' }}>
                        <TabButton active={activeTab === 'ALL_CONTENT'} onClick={() => setActiveTab('ALL_CONTENT')} label="Videos" />
                        <TabButton active={activeTab === 'LIVE'} onClick={() => setActiveTab('LIVE')} label="Live" />
                        <TabButton active={activeTab === 'PLAYLISTS'} onClick={() => setActiveTab('PLAYLISTS')} label="Playlists" />
                    </div>

                    {/* Tools (View & Sort) */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {activeTab !== 'PLAYLISTS' && (
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                style={{ background: '#1a1a1e', color: '#a1a1aa', border: '1px solid #333', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
                            >
                                <option value="ALL">Any Time</option>
                                <option value="WEEK">This Week</option>
                                <option value="MONTH">This Month</option>
                                <option value="YEAR">This Year</option>
                            </select>
                        )}

                        <div style={{ display: 'flex', background: '#1a1a1e', borderRadius: '8px', padding: '2px' }}>
                            <button onClick={() => setViewMode('grid')} style={{ padding: '6px', background: viewMode === 'grid' ? '#3f3f46' : 'transparent', border: 'none', color: viewMode === 'grid' ? 'white' : '#71717a', borderRadius: '6px', cursor: 'pointer' }}><FaThLarge size={14} /></button>
                            <button onClick={() => setViewMode('list')} style={{ padding: '6px', background: viewMode === 'list' ? '#3f3f46' : 'transparent', border: 'none', color: viewMode === 'list' ? 'white' : '#71717a', borderRadius: '6px', cursor: 'pointer' }}><FaList size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>Loading content...</div>
            ) : (
                <>
                    <div className={viewMode === 'grid' ? 'responsive-grid' : 'list-view-container'}>
                        {items.map(item => {
                            if (item.kind === 'playlist') {
                                return <PlaylistCard key={item.id} playlist={item} onClick={() => navigate(`/playlist/${item.id}`)} />;
                            } else {
                                return <VideoCard key={item.id} video={item} onClick={() => navigate(`/watch/${item.id}`)} viewMode={viewMode} />;
                            }
                        })}
                    </div>
                    {items.length === 0 && !loading && <div style={{ textAlign: 'center', color: '#555', marginTop: '40px' }}>No content found.</div>}
                    {pageToken && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <button onClick={handleLoadMore} disabled={loadingMore} style={{ background: '#2a2a35', border: '1px solid #3f3f46', color: 'white', padding: '12px 32px', borderRadius: '24px', cursor: loadingMore ? 'wait' : 'pointer' }}>
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
    <button onClick={onClick} style={{ padding: '8px 16px', borderRadius: '20px', border: active ? '1px solid #646cff' : '1px solid #333', background: active ? '#646cff22' : 'transparent', color: active ? '#646cff' : '#a1a1aa', cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</button>
);
const TabButton = ({ active, onClick, label }) => (
    <button onClick={onClick} style={{ background: 'transparent', border: 'none', borderBottom: active ? '2px solid #646cff' : '2px solid transparent', color: active ? 'white' : '#71717a', padding: '8px 12px', cursor: 'pointer', fontWeight: active ? '600' : '400', fontSize: '15px', whiteSpace: 'nowrap' }}>{label}</button>
);

export default Feed;

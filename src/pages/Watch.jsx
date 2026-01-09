import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { FaArrowLeft, FaThumbsUp, FaCommentDots, FaPlay, FaRedo, FaEyeSlash } from 'react-icons/fa';
import { trackHeartbeat } from '../services/tracker';
import { fetchVideoDetails, fetchComments, fetchLiveChatMessages } from '../services/youtube';
import { addToHistory } from '../services/history';
import { formatDistanceToNow } from 'date-fns';
import NotesPanel from '../components/NotesPanel';

const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const intervalRef = useRef(null);
    const chatTimeoutRef = useRef(null); // Changed to timeout for dynamic polling
    const chatPageTokenRef = useRef('');

    const [details, setDetails] = useState(null);
    const [comments, setComments] = useState([]);
    const [showDescription, setShowDescription] = useState(false);
    const [duration, setDuration] = useState('');

    const [playerState, setPlayerState] = useState(-1);
    const [showLiveChat, setShowLiveChat] = useState(false); // Default false to save quota
    const [liveChatMessages, setLiveChatMessages] = useState([]);
    const [liveChatId, setLiveChatId] = useState(null);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const vidDetails = await fetchVideoDetails(id);
            setDetails(vidDetails);
            if (vidDetails) {
                // Add to history
                addToHistory({
                    id: vidDetails.id,
                    title: vidDetails.snippet.title,
                    thumbnail: vidDetails.snippet.thumbnails.high?.url,
                    channelTitle: vidDetails.snippet.channelTitle,
                    publishedAt: vidDetails.snippet.publishedAt
                });

                // Format Duration
                if (vidDetails.contentDetails?.duration) {
                    const dur = vidDetails.contentDetails.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm ').replace('S', 's');
                    setDuration(dur);
                }

                // Check if Live
                if (vidDetails.snippet.liveBroadcastContent === 'live') {
                    setIsLive(true);
                }

                // Save Last Watched
                localStorage.setItem('last_watched_video', JSON.stringify({
                    id: vidDetails.id,
                    title: vidDetails.snippet.title,
                    timestamp: Date.now()
                }));
            }

            if (vidDetails?.liveStreamingDetails?.activeLiveChatId) {
                setLiveChatId(vidDetails.liveStreamingDetails.activeLiveChatId);
            } else {
                setLiveChatId(null);
            }

            const fetchedComments = await fetchComments(id);
            setComments(fetchedComments);
        };
        loadData();
        return () => { stopTracking(); stopChatPolling(); };
    }, [id]);

    useEffect(() => {
        if (liveChatId && showLiveChat) {
            chatPageTokenRef.current = ''; // Reset token when opening chat
            pollChat();
        } else {
            stopChatPolling();
        }
    }, [liveChatId, showLiveChat]);

    const pollChat = async () => {
        if (!liveChatId || !showLiveChat) return;

        const { items, nextPageToken, pollingIntervalMillis } = await fetchLiveChatMessages(liveChatId, chatPageTokenRef.current);

        if (items && items.length > 0) {
            setLiveChatMessages(prev => [...prev.slice(-50), ...items]); // Keep last 50 messages
        }

        if (nextPageToken) {
            chatPageTokenRef.current = nextPageToken;
        }

        // Schedule next poll
        chatTimeoutRef.current = setTimeout(pollChat, Math.max(pollingIntervalMillis, 5000)); // Min 5s
    };

    const stopChatPolling = () => {
        if (chatTimeoutRef.current) {
            clearTimeout(chatTimeoutRef.current);
            chatTimeoutRef.current = null;
        }
    };

    const onStateChange = (event) => {
        setPlayerState(event.data);
        if (event.data === 1) startTracking(); else stopTracking();
    };

    const startTracking = () => { if (intervalRef.current) return; intervalRef.current = setInterval(() => trackHeartbeat(id), 60000); };
    const stopTracking = () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
    const handleResume = () => playerRef.current?.playVideo();
    const handleReplay = () => { playerRef.current?.seekTo(0); playerRef.current?.playVideo(); };

    const getCurrentTime = () => playerRef.current?.getCurrentTime() || 0;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px', fontSize: '16px'
                }}
            >
                <FaArrowLeft /> Back
            </button>

            <div style={{
                position: 'relative', paddingBottom: '56.25%', height: 0, backgroundColor: '#000', borderRadius: '16px',
                overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', marginBottom: '24px'
            }}>
                <YouTube
                    videoId={id}
                    opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1, modestbranding: 1, rel: 0 } }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    onStateChange={onStateChange}
                    onReady={(e) => playerRef.current = e.target}
                />

                {(playerState === 2 || playerState === 0) && (
                    <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(10, 10, 12, 0.85)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '24px', fontSize: '18px', color: '#e4e4e7' }}>{playerState === 0 ? "Video Completed" : "Paused"}</div>
                            <button onClick={playerState === 0 ? handleReplay : handleResume} style={{ background: '#646cff', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '50px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 0 20px rgba(100, 108, 255, 0.4)' }}>
                                {playerState === 0 ? <><FaRedo /> Replay</> : <><FaPlay /> Resume</>}
                            </button>
                            <div style={{ marginTop: '32px', fontSize: '14px', color: '#71717a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FaEyeSlash /> Distractions Hidden</div>
                        </div>
                    </div>
                )}

                {/* Live Chat Overlay */}
                {liveChatId && showLiveChat && (
                    <div style={{
                        position: 'absolute', bottom: '20px', left: '20px', width: '300px', height: '400px',
                        background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 25, pointerEvents: 'auto'
                    }}>
                        <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>Live Chat</span>
                            <button onClick={() => setShowLiveChat(false)} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }} className="scrollbar-hide">
                            {liveChatMessages.length === 0 && <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>Connecting to chat...</div>}
                            {liveChatMessages.map((msg, idx) => (
                                <div key={msg.id + idx} style={{ fontSize: '13px', textShadow: '0 1px 1px black' }}>
                                    <span style={{ fontWeight: 'bold', color: msg.author === details?.snippet?.channelTitle ? '#38bdf8' : '#a1a1aa', marginRight: '6px' }}>{msg.author}:</span>
                                    <span style={{ color: 'white' }}>{msg.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Show Chat Button */}
                {liveChatId && !showLiveChat && (
                    <button onClick={() => setShowLiveChat(true)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', zIndex: 25, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <FaCommentDots /> Show Live Chat
                    </button>
                )}
            </div>

            <div className="watch-layout">
                <div>
                    <h1 style={{ fontSize: '20px', margin: '0 0 12px 0', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                        {details?.snippet?.title || 'Loading...'}
                        {duration && <span style={{ fontSize: '14px', color: 'var(--accent)', marginLeft: '12px', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle' }}>{duration}</span>}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                            <span style={{ color: 'var(--text-primary)' }}>{details?.snippet?.channelTitle}</span>
                        </div>
                    </div>

                    <div style={{ background: 'transparent', padding: '16px', borderRadius: '12px', marginBottom: '32px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', maxHeight: showDescription ? 'none' : '100px', overflow: 'hidden' }}>{details?.snippet?.description}</div>
                        <button onClick={() => setShowDescription(!showDescription)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', marginTop: '8px', cursor: 'pointer', fontSize: '13px' }}>{showDescription ? 'Show Less' : 'Show More'}</button>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <NotesPanel videoId={id} getCurrentTime={getCurrentTime} />
                    </div>

                    <div>
                        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>Comments</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {comments.map(comment => (
                                <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                                    <img src={comment.authorImage} alt={comment.author} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{comment.author}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{formatDistanceToNow(new Date(comment.publishedAt), { addSuffix: true })}</span>
                                        </div>
                                        <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: comment.text }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}><FaThumbsUp /> {comment.likeCount}</div>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No comments found.</div>}
                        </div>
                    </div>
                </div>

                {/* Stats Panel (Replaces AI) */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', position: 'sticky', top: '24px', width: '350px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Video Stats</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Views</span>
                            <span style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)' }}>
                                {details?.statistics?.viewCount ? parseInt(details.statistics.viewCount).toLocaleString() : '—'}
                            </span>
                        </div>

                        <div>
                            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Likes</span>
                            <span style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)' }}>
                                {details?.statistics?.likeCount ? parseInt(details.statistics.likeCount).toLocaleString() : '—'}
                            </span>
                        </div>

                        <div>
                            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Uploaded</span>
                            <span style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                                {details?.snippet?.publishedAt ? new Date(details.snippet.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                            </span>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {details?.snippet?.publishedAt ? formatDistanceToNow(new Date(details.snippet.publishedAt), { addSuffix: true }) : ''}
                            </div>
                        </div>

                        {details?.snippet?.tags && details.snippet.tags.length > 0 && (
                            <div>
                                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tags</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {details.snippet.tags.slice(0, 5).map(tag => (
                                        <span key={tag} style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)', fontSize: '11px', padding: '4px 8px', borderRadius: '4px' }}>#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Watch;

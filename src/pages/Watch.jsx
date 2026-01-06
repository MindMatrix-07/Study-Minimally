import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { FaArrowLeft, FaRobot, FaThumbsUp } from 'react-icons/fa';
import { trackHeartbeat } from '../services/tracker';
import { fetchVideoDetails, fetchComments } from '../services/youtube';
import { analyzeComments } from '../services/gemini';
import { formatDistanceToNow } from 'date-fns';

const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const intervalRef = useRef(null);

    // State
    const [details, setDetails] = useState(null);
    const [comments, setComments] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [showDescription, setShowDescription] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const vidDetails = await fetchVideoDetails(id);
            setDetails(vidDetails);

            // Comments & AI
            setAnalyzing(true);
            const fetchedComments = await fetchComments(id);
            setComments(fetchedComments);

            if (fetchedComments.length > 0) {
                const analysis = await analyzeComments(fetchedComments);
                setAiAnalysis(analysis);
            } else {
                setAiAnalysis({ summary: "No comments to analyze.", highlights: [] });
            }
            setAnalyzing(false);
        };
        loadData();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [id]);

    const onStateChange = (event) => {
        if (event.data === 1) startTracking();
        else stopTracking();
    };

    const startTracking = () => {
        if (intervalRef.current) return;
        intervalRef.current = setInterval(() => {
            trackHeartbeat(id);
        }, 60000);
    };

    const stopTracking = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'transparent', border: 'none', color: '#a1a1aa',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px', fontSize: '16px'
                }}
            >
                <FaArrowLeft /> Back
            </button>

            {/* Player */}
            <div style={{
                position: 'relative', paddingBottom: '56.25%', height: 0, backgroundColor: '#000', borderRadius: '16px',
                overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', marginBottom: '24px'
            }}>
                <YouTube
                    videoId={id}
                    opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1, modestbranding: 1 } }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    onStateChange={onStateChange}
                    onReady={(e) => playerRef.current = e.target}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>

                {/* Left: Details & Comments */}
                <div>
                    <h1 style={{ fontSize: '20px', margin: '0 0 12px 0', lineHeight: 1.4 }}>{details?.snippet?.title || 'Loading...'}</h1>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>
                        <span>{details?.snippet?.channelTitle}</span>
                        <span>{details?.statistics?.viewCount ? parseInt(details.statistics.viewCount).toLocaleString() : 0} views</span>
                    </div>

                    {/* Description */}
                    <div style={{ background: '#1a1a1e', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
                        <div
                            style={{
                                fontSize: '14px', lineHeight: '1.6', color: '#d4d4d8', whiteSpace: 'pre-wrap',
                                maxHeight: showDescription ? 'none' : '100px', overflow: 'hidden', position: 'relative'
                            }}
                        >
                            {details?.snippet?.description}
                        </div>
                        <button
                            onClick={() => setShowDescription(!showDescription)}
                            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', marginTop: '8px', cursor: 'pointer', fontSize: '13px' }}
                        >
                            {showDescription ? 'Show Less' : 'Show More'}
                        </button>
                    </div>

                    {/* Full Comments Section */}
                    <div>
                        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Comments</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {comments.map(comment => (
                                <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                                    <img
                                        src={comment.authorImage}
                                        alt={comment.author}
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{comment.author}</span>
                                            <span style={{ fontSize: '11px', color: '#71717a' }}>
                                                {formatDistanceToNow(new Date(comment.publishedAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div
                                            style={{ fontSize: '14px', lineHeight: '1.5', color: '#d4d4d8' }}
                                            dangerouslySetInnerHTML={{ __html: comment.text }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12px', color: '#71717a' }}>
                                            <FaThumbsUp /> {comment.likeCount}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <div style={{ color: '#71717a', fontStyle: 'italic' }}>No comments found.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: AI Analysis */}
                <div style={{ background: 'rgba(100, 108, 255, 0.05)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(100, 108, 255, 0.1)', position: 'sticky', top: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#818cf8' }}>
                        <FaRobot size={20} />
                        <h3 style={{ margin: 0, fontSize: '16px' }}>AI Highlights</h3>
                    </div>

                    {analyzing ? (
                        <div style={{ color: '#a1a1aa', fontSize: '14px', fontStyle: 'italic' }}>Thinking...</div>
                    ) : aiAnalysis ? (
                        <div>
                            <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#e4e4e7', marginBottom: '20px', fontStyle: 'italic' }}>
                                "{aiAnalysis.summary}"
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#a1a1aa' }}>TOP INSIGHTS</label>
                                {aiAnalysis.highlights.map((h, i) => (
                                    <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '13px', color: '#fff', marginBottom: '4px' }}>{h.text}</div>
                                        <div style={{ fontSize: '11px', color: '#a1a1aa' }}>— {h.author}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#a1a1aa', fontSize: '14px' }}>Failed to load analysis.</div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Watch;

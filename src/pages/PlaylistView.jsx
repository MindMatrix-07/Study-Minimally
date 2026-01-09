import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPlaylistItems, fetchPlaylistDetails } from '../services/youtube';
import VideoCard from '../components/VideoCard';
import { FaArrowLeft } from 'react-icons/fa';

const PlaylistView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const playlistDetails = await fetchPlaylistDetails(id);
            setDetails(playlistDetails);

            const results = await fetchPlaylistItems(id);
            setVideos(results.items);
            setLoading(false);
        };
        load();
    }, [id]);

    return (
        <div>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#a1a1aa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    marginBottom: '24px'
                }}
            >
                <FaArrowLeft /> Back
            </button>

            {loading ? (
                <div style={{ textAlign: 'center', color: '#666' }}>Loading playlist...</div>
            ) : (
                <>
                    <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>{details?.snippet?.title}</h1>
                    <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>{videos.length} videos</p>

                    <div className="list-view-container">
                        {videos.map(video => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                onClick={() => navigate(`/watch/${video.id}`)}
                                viewMode="list"
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PlaylistView;

import React from 'react';
import { motion } from 'framer-motion';
import { FaPlayCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const VideoCard = ({ video, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="video-card"
            onClick={() => onClick(video)}
            style={{
                cursor: 'pointer',
                backgroundColor: '#1a1a1e',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}
        >
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s'
                }} className="hover-overlay">
                    <FaPlayCircle size={48} color="white" />
                </div>
            </div>
            <div style={{ padding: '12px' }}>
                <h3 style={{
                    fontSize: '14px',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {video.title}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#a1a1aa' }}>
                    <span>{video.channelTitle}</span>
                    <span>{video.publishedAt ? formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true }) : ''}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default VideoCard;

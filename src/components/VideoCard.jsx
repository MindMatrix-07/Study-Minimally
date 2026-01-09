import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const VideoCard = ({ video, onClick, viewMode = 'grid' }) => {
    const isList = viewMode === 'list';

    return (
        <motion.div
            whileHover={{ scale: isList ? 1.01 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={isList ? 'video-card-list' : ''}
            style={{
                cursor: 'pointer',
                backgroundColor: 'transparent',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: isList ? 'flex' : 'block',
                gap: isList ? '16px' : '0',
                height: isList ? '140px' : 'auto',
                transition: 'border-color 0.2s'
            }}
        >
            <div
                className={isList ? 'video-card-list-img' : ''}
                style={{
                    position: 'relative',
                    width: isList ? 'clamp(120px, 30vw, 240px)' : '100%', // Responsive width for list mode
                    paddingTop: isList ? '0' : '56.25%',
                    height: isList ? '100%' : '0',
                    flexShrink: 0
                }}>
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    style={{
                        position: isList ? 'absolute' : 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
                {video.isLive && (
                    <div style={{
                        position: 'absolute', bottom: '8px', right: '8px',
                        background: '#ef4444', color: 'white', fontSize: '10px',
                        fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px'
                    }}>
                        LIVE
                    </div>
                )}
            </div>

            <div className={isList ? 'video-card-list-content' : ''} style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{
                    fontSize: '14px',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: isList ? 1 : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {video.title}
                </h3>

                <div style={{ color: '#a1a1aa', fontSize: '12px', marginTop: 'auto' }}>
                    <div style={{ marginBottom: '4px', fontWeight: '500' }}>{video.channelTitle}</div>
                    <div>
                        {video.publishedAt && formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VideoCard;

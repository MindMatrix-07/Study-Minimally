import React from 'react';
import { motion } from 'framer-motion';
import { RiPlayList2Fill } from 'react-icons/ri';

const PlaylistCard = ({ playlist, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(playlist)}
            style={{
                cursor: 'pointer',
                backgroundColor: '#1a1a1e',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                position: 'relative'
            }}
        >
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                {/* Stack Effect for Playlist */}
                <div style={{
                    position: 'absolute', top: '-6px', left: '0', right: '0', height: '10px',
                    background: '#2a2a35', margin: '0 10px', borderTopLeftRadius: '6px', borderTopRightRadius: '6px', zIndex: 0
                }} />
                <img
                    src={playlist.thumbnail}
                    alt={playlist.title}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 1
                    }}
                />
                <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    top: 0,
                    width: '40%',
                    background: 'linear-gradient(to left, rgba(0,0,0,0.8), transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '20px',
                    zIndex: 2
                }}>
                    <div style={{ textAlign: 'center', color: 'white' }}>
                        <RiPlayList2Fill size={32} />
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{playlist.itemCount}</div>
                    </div>
                </div>
            </div>
            <div style={{ padding: '12px', zIndex: 2, position: 'relative' }}>
                <h3 style={{
                    fontSize: '14px',
                    margin: '0 0 4px 0',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {playlist.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                    View full playlist
                </div>
            </div>
        </motion.div>
    );
};

export default PlaylistCard;

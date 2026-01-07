import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaDownload, FaExpand, FaClock } from 'react-icons/fa';

const NotesPanel = ({ videoId, getCurrentTime }) => {
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(`notes_${videoId}`);
        if (stored) setNotes(JSON.parse(stored));
    }, [videoId]);

    const saveNote = () => {
        if (!currentNote.trim()) return;
        const time = getCurrentTime ? getCurrentTime() : 0;
        const newNote = {
            id: Date.now(),
            text: currentNote,
            timestamp: time,
            formattedTime: new Date(time * 1000).toISOString().substr(11, 8)
        };
        const updated = [newNote, ...notes];
        setNotes(updated);
        localStorage.setItem(`notes_${videoId}`, JSON.stringify(updated));
        setCurrentNote('');
    };

    const deleteNote = (id) => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        localStorage.setItem(`notes_${videoId}`, JSON.stringify(updated));
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '20px',
            height: isFullscreen ? '100vh' : 'auto',
            position: isFullscreen ? 'fixed' : 'static',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: isFullscreen ? 1000 : 'auto',
            display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaEdit color="var(--accent)" /> Course Notes
                </h3>
                <button onClick={() => setIsFullscreen(!isFullscreen)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <FaExpand />
                </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Type a note... (Timestamp auto-captured)"
                    onKeyDown={(e) => e.key === 'Enter' && saveNote()}
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '12px',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={saveNote}
                    style={{
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0 20px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Add
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }} className="scrollbar-hide">
                {notes.length === 0 && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', marginTop: '20px' }}>No notes taken yet.</div>}
                {notes.map(note => (
                    <div key={note.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '12px',
                        borderRadius: '8px',
                        borderLeft: '3px solid var(--accent)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaClock size={10} /> {note.formattedTime}
                            </span>
                            <button onClick={() => deleteNote(note.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}><FaTrash /></button>
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.5' }}>{note.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotesPanel;

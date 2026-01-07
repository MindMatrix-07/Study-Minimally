import React, { useState, useEffect } from 'react';
import { quotes } from '../data/quotes';
import { FaSyncAlt } from 'react-icons/fa';

const QuoteWidget = () => {
    const [currentQuote, setCurrentQuote] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const getRandomQuote = () => {
        setIsAnimating(true);
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * quotes.length);
            setCurrentQuote(quotes[randomIndex]);
            setIsAnimating(false);
        }, 300);
    };

    useEffect(() => {
        getRandomQuote();
    }, []);

    if (!currentQuote) return null;

    return (
        <div style={{
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            margin: '20px 0',
            textAlign: 'center',
            position: 'relative',
            transition: 'all 0.3s ease'
        }}>
            <button
                onClick={getRandomQuote}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                }}
                className="refresh-btn"
            >
                <FaSyncAlt />
            </button>
            <div style={{
                opacity: isAnimating ? 0 : 1,
                transition: 'opacity 0.3s ease',
                transform: isAnimating ? 'translateY(10px)' : 'translateY(0)'
            }}>
                <p style={{
                    fontSize: '1.1rem',
                    fontStyle: 'italic',
                    color: '#e2e8f0',
                    marginBottom: '10px',
                    fontFamily: '"Georgia", serif',
                    lineHeight: '1.6'
                }}>
                    "{currentQuote.text}"
                </p>
                <p style={{
                    fontSize: '0.9rem',
                    color: '#94a3b8',
                    fontWeight: '500',
                    letterSpacing: '0.5px'
                }}>
                    — {currentQuote.author}
                </p>
            </div>
        </div>
    );
};

export default QuoteWidget;

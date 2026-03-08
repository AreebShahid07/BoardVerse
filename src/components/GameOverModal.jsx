import React from 'react';
import RetroPanel from './RetroPanel';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const GameOverModal = ({ title, message, onRestart }) => {
    const navigate = useNavigate();

    if (!title || !message) return null;

    return (
        <RetroPanel woodStyle="parchment" padding="large" className="game-over-modal slide-in">
            <div className="gold-frame-inner">
                <h1 className="game-over-title">{title}</h1>
                <div className="retro-divider" style={{ width: '60%', margin: '1rem auto' }} />
                <h2 className="game-over-text">{message}</h2>

                <div className="modal-actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <Button onClick={onRestart} variant="primary" fullWidth>Play Again</Button>
                    <Button onClick={() => navigate('/')} variant="secondary" fullWidth>Return to Lobby</Button>
                </div>
            </div>
        </RetroPanel>
    );
};

export default GameOverModal;

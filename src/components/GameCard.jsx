import React from 'react';
import { Link } from 'react-router-dom';
import RetroPanel from './RetroPanel';
import Button from './Button';
import './GameCard.css';

const GameCard = ({ title, status, description, linkTo, icon }) => {
    const isAvailable = status === 'available';

    return (
        <RetroPanel className="game-card" woodStyle="parchment" padding="normal">
            <div className="game-card-icon">{icon}</div>
            <h3 className="game-card-title">{title}</h3>
            <div className="game-card-divider" />
            <p className="game-card-description">{description}</p>

            <div className="game-card-action">
                {isAvailable ? (
                    <Link to={linkTo} style={{ textDecoration: 'none', width: '100%' }}>
                        <Button variant="primary" fullWidth>Play Now</Button>
                    </Link>
                ) : (
                    <div className="coming-soon-badge">Coming Soon</div>
                )}
            </div>
        </RetroPanel>
    );
};

export default GameCard;

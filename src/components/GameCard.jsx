import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, CircleDot, Layers } from 'lucide-react';
import RetroPanel from './RetroPanel';
import Button from './Button';
import './GameCard.css';

// Custom game icons with better visual design
const GameIcon = ({ type }) => {
    const iconProps = {
        size: 48,
        strokeWidth: 1.5,
        className: "game-icon-svg"
    };

    switch (type) {
        case 'chess':
            return (
                <div className="game-icon-wrapper chess-icon">
                    <Crown {...iconProps} />
                </div>
            );
        case 'checkers':
            return (
                <div className="game-icon-wrapper checkers-icon">
                    <CircleDot {...iconProps} />
                </div>
            );
        case 'reversi':
            return (
                <div className="game-icon-wrapper reversi-icon">
                    <Layers {...iconProps} />
                </div>
            );
        default:
            return (
                <div className="game-icon-wrapper">
                    <Crown {...iconProps} />
                </div>
            );
    }
};

const GameCard = ({ title, status, description, linkTo, icon }) => {
    const isAvailable = status === 'available';

    return (
        <RetroPanel className="game-card" woodStyle="parchment" padding="normal">
            <GameIcon type={icon} />
            
            <h3 className="game-card-title">{title}</h3>
            
            <div className="game-card-divider">
                <span className="divider-left" />
                <span className="divider-center">&#10022;</span>
                <span className="divider-right" />
            </div>
            
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

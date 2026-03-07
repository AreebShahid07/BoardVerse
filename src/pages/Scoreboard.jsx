import React, { useState, useEffect } from 'react';
import { getStats, resetStats } from '../utils/storage';
import RetroPanel from '../components/RetroPanel';
import Button from '../components/Button';
import './Scoreboard.css';

const Scoreboard = () => {
    const [stats, setStats] = useState({
        totalGames: 0,
        chess: { matches: 0, playerWins: 0, botWins: 0 },
        checkers: { matches: 0, playerWins: 0, botWins: 0 },
        reversi: { matches: 0, playerWins: 0, botWins: 0 }
    });

    useEffect(() => {
        setStats(getStats());
    }, []);

    const handleReset = () => {
        if (window.confirm('Do you wish to completely wipe the Chronicles of Strategy?')) {
            resetStats();
            setStats(getStats());
        }
    };

    // Helper to render individual game columns
    const renderGameStats = (gameTitle, gameCode, themeClass) => {
        const gameStats = stats[gameCode] || { matches: 0, playerWins: 0, botWins: 0 };
        return (
            <div className={`game-stats-column ${themeClass}`}>
                <h3 className="game-stats-title">{gameTitle}</h3>
                <div className="stat-card">
                    <span className="stat-label">Matches</span>
                    <span className="stat-value">{gameStats.matches || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Human Wins</span>
                    <span className="stat-value">{gameStats.playerWins || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Automaton Wins</span>
                    <span className="stat-value">{gameStats.botWins || 0}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="scoreboard-container fade-in">
            <div className="scoreboard-header">
                <h1 className="scoreboard-title">Tournament Records</h1>
                <div className="retro-divider" style={{ width: '30%', marginTop: '1rem' }} />
            </div>

            <div className="scoreboard-content">
                <div className="tournament-board">
                    <RetroPanel woodStyle="parchment" padding="large" className="stats-panel">
                        <h2 className="record-board-title">The Grand Ledger</h2>

                        <div className="global-stats">
                            <div className="stat-card">
                                <span className="stat-label">Total Historical Matches</span>
                                <span className="stat-value">{stats.totalGames}</span>
                            </div>
                        </div>

                        <div className="games-stats-grid">
                            {renderGameStats('Chess', 'chess', 'theme-chess')}
                            {renderGameStats('Checkers', 'checkers', 'theme-checkers')}
                            {renderGameStats('Reversi', 'reversi', 'theme-reversi')}
                        </div>

                        <div className="scoreboard-actions">
                            <Button variant="secondary" onClick={handleReset}>Clear Ledger</Button>
                        </div>
                    </RetroPanel>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard;

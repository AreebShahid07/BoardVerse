import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStats, resetStats } from '../utils/storage';
import RetroPanel from '../components/RetroPanel';
import Button from '../components/Button';
import styles from './Scoreboard.module.css';

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
            const s = getStats();
            setStats(s);
        }
    };

    const renderGameStats = (gameTitle, gameCode, themeClass) => {
        const gameStats = stats[gameCode] || { matches: 0, playerWins: 0, botWins: 0, draws: 0 };
        const winRate = gameStats.matches > 0
            ? ((gameStats.playerWins / gameStats.matches) * 100).toFixed(1)
            : 0;

        return (
            <motion.div
                className={`${styles['game-stats-column']} ${styles[themeClass]}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h3 className={styles['game-stats-title']}>{gameTitle}</h3>

                <div className={styles['stat-grid-mini']}>
                    <div className={styles['stat-card-mini']}>
                        <span className={styles['stat-label']}>Matches</span>
                        <span className={styles['stat-value']}>
                            {gameStats.matches || 0}
                        </span>
                    </div>
                    <div className={styles['stat-card-mini']}>
                        <span className={styles['stat-label']}>Win Rate</span>
                        <span className={styles['stat-value']}>{winRate}%</span>
                    </div>
                </div>

                <div className={styles['stat-card']}>
                    <span className={styles['stat-label']}>Human Wins</span>
                    <span className={styles['stat-value']}>
                        {gameStats.playerWins || 0}
                    </span>
                </div>
                <div className={styles['stat-card']}>
                    <span className={styles['stat-label']}>Automaton Wins</span>
                    <span className={styles['stat-value']}>
                        {gameStats.botWins || 0}
                    </span>
                </div>
                <div className={styles['stat-card']}>
                    <span className={styles['stat-label']}>Stalemates/Draws</span>
                    <span className={styles['stat-value']}>
                        {gameStats.draws || 0}
                    </span>
                </div>
            </motion.div>
        );
    };

    return (
        <div className={`${styles['scoreboard-container']} fade-in`}>
            <div className={styles['scoreboard-header']}>
                <h1 className={styles['scoreboard-title']}>Tournament Records</h1>
                <div className="retro-divider" style={{ width: '30%', marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
            </div>

            <div className={styles['scoreboard-content']}>
                <div className={styles['tournament-board']}>
                    <RetroPanel woodStyle="parchment" padding="large" className={styles['stats-panel']}>
                        <h2 className={styles['record-board-title']}>The Grand Ledger</h2>

                        <div className={styles['global-stats']}>
                            <div className={styles['stat-card']}>
                                <span className={styles['stat-label']}>Total Matches Played</span>
                                <span className={styles['stat-value']}>
                                    {stats.totalGames}
                                </span>
                            </div>
                            <div className={styles['stat-card']}>
                                <span className={styles['stat-label']}>Total Strategic Draws</span>
                                <span className={styles['stat-value']}>
                                    {stats.totalDraws || 0}
                                </span>
                            </div>
                        </div>

                        <motion.div
                            className={styles['games-stats-grid']}
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.15 }
                                }
                            }}
                        >
                            {renderGameStats('Chess', 'chess', 'theme-chess')}
                            {renderGameStats('Checkers', 'checkers', 'theme-checkers')}
                            {renderGameStats('Reversi', 'reversi', 'theme-reversi')}
                        </motion.div>

                        <div className={styles['scoreboard-actions']}>
                            <Button variant="secondary" onClick={handleReset}>Clear Ledger</Button>
                        </div>
                    </RetroPanel>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard;

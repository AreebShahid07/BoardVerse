import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { P1 } from './engine';
import { useReversiGame } from './useReversiGame';
import GameBoardLayout from '../../components/GameBoardLayout';
import ReversiBoard from './ReversiBoard';
import RetroPanel from '../../components/RetroPanel';
import Button from '../../components/Button';
import GameOverModal from '../../components/GameOverModal';
import { Bot, User, Volume2, VolumeX, RotateCcw, Undo2 } from 'lucide-react';
import styles from './ReversiGame.module.css';

const ReversiGame = () => {
    const navigate = useNavigate();
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [boardWidth, setBoardWidth] = useState(550);

    const {
        engine, gameMode, setGameMode, botLevel, setBotLevel,
        botIsThinking, gameOverTitle, gameOverMsg, moveHistory,
        handleSquareClick, restartGame, undoMove, validMoves, p1Count, p2Count
    } = useReversiGame(soundEnabled);

    // Responsive board
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            if (w < 800) setBoardWidth(w - 60);
            else if (w < 1100) setBoardWidth(400);
            else setBoardWidth(550);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Convert history array to pairs for the UI
    const historyPairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        historyPairs.push([moveHistory[i], moveHistory[i + 1]]);
    }

    const leftPanel = (
        <RetroPanel title="Notation & Score" woodStyle="parchment" padding="small" className={styles.historyPanel}>
            <div style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.2rem', padding: '10px 0', borderBottom: '1px solid #d4b483', marginBottom: '10px' }}>
                <span style={{ color: '#000' }}>Black: {p1Count}</span>
                {'  |  '}
                <span style={{ color: '#666' }}>White: {p2Count}</span>
            </div>
            <div className={styles.historyList}>
                {historyPairs.length === 0 ? (
                    <div className={styles.historyEmpty}>Notebook empty...</div>
                ) : (
                    historyPairs.map((pair, idx) => (
                        <div key={idx} className={styles.historyRow}>
                            <span className={styles.historyNumber}>{idx + 1}.</span>
                            <span className={styles.historyWhite}>{pair[0]}</span>
                            <span className={styles.historyBlack}>{pair[1] || ''}</span>
                        </div>
                    ))
                )}
            </div>
        </RetroPanel>
    );

    const centerStatusBar = (
        <>
            {botIsThinking ? (
                <span className="turn-indicator bot-thinking">Automaton pondering...</span>
            ) : (
                <span className={`turn-indicator ${engine.currentTurn === P1 ? 'active-w' : 'active-b'}`}>
                    {engine.currentTurn === P1 ? 'Black to move' : 'White to move'}
                </span>
            )}
        </>
    );

    const centerBoard = (
        <ReversiBoard
            board={engine.board}
            onSquareClick={handleSquareClick}
            validMoves={validMoves}
            boardWidth={boardWidth}
        />
    );

    const rightPanel = (
        <RetroPanel title="Controls" woodStyle="dark" padding="normal" className={styles.settingsPanel}>
            <div className={styles.controlGroup}>
                <label>Opponent:</label>
                <div className={styles.modeSelector}>
                    <Button
                        variant={gameMode === 'bot' ? 'primary' : 'secondary'}
                        onClick={() => setGameMode('bot')}
                        disabled={moveHistory.length > 0}
                    >
                        <span className={styles.btnIcon}><Bot size={18} /></span> Automaton
                    </Button>
                    <Button
                        variant={gameMode === 'local' ? 'primary' : 'secondary'}
                        onClick={() => setGameMode('local')}
                        disabled={moveHistory.length > 0}
                    >
                        <span className={styles.btnIcon}><User size={18} /></span> Local Peer
                    </Button>
                </div>
            </div>

            {gameMode === 'bot' && (
                <div className={styles.controlGroup}>
                    <label>Difficulty (1-5): {botLevel}</label>
                    <input
                        type="range"
                        min="1" max="5"
                        value={botLevel}
                        onChange={(e) => setBotLevel(parseInt(e.target.value))}
                        disabled={moveHistory.length > 0}
                        className={styles.vintageSlider}
                    />
                </div>
            )}

            <div className={styles.controlActions}>
                <Button onClick={() => setSoundEnabled(!soundEnabled)} variant="secondary" fullWidth>
                    <span className={styles.btnIcon}>
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </span> Toggle Sound
                </Button>
                <Button onClick={undoMove} variant="secondary" fullWidth disabled={moveHistory.length === 0}>
                    <span className={styles.btnIcon}><Undo2 size={18} /></span> Retract Move
                </Button>
                <Button onClick={restartGame} variant="primary" fullWidth>
                    <span className={styles.btnIcon}><RotateCcw size={18} /></span> New Match
                </Button>
            </div>
        </RetroPanel>
    );

    const gameOverModalNode = (gameOverTitle && gameOverMsg) ? (
        <GameOverModal
            title={gameOverTitle}
            message={gameOverMsg}
            onRestart={restartGame}
        />
    ) : null;

    return (
        <GameBoardLayout
            leftPanel={leftPanel}
            centerStatusBar={centerStatusBar}
            centerBoard={centerBoard}
            rightPanel={rightPanel}
            gameOverModal={gameOverModalNode}
        />
    );
};

export default ReversiGame;

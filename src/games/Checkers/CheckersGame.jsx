import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { P1, P2 } from './engine';
import { useCheckersGame } from './useCheckersGame';
import GameBoardLayout from '../../components/GameBoardLayout';
import CheckersBoard from './CheckersBoard';
import RetroPanel from '../../components/RetroPanel';
import Button from '../../components/Button';
import { Bot, User, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import styles from './CheckersGame.module.css';

const CheckersGame = () => {
    const navigate = useNavigate();
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [boardWidth, setBoardWidth] = useState(550);

    const {
        engine, gameMode, setGameMode, botLevel, setBotLevel,
        botIsThinking, gameOverMsg, moveHistory,
        selectedSquare, validJumpsFromSelected,
        handleSquareClick, restartGame
    } = useCheckersGame(soundEnabled);

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
        <RetroPanel title="Notation" woodStyle="parchment" padding="small" className={styles.historyPanel}>
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
                    {engine.currentTurn === P1 ? 'Red to move' : 'Black to move'}
                    {validJumpsFromSelected && ' (Jump Required)'}
                </span>
            )}
        </>
    );

    const centerBoard = (
        <CheckersBoard
            board={engine.board}
            onSquareClick={handleSquareClick}
            selectedSquare={selectedSquare}
            turn={engine.currentTurn}
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
                <Button onClick={restartGame} variant="primary" fullWidth>
                    <span className={styles.btnIcon}><RotateCcw size={18} /></span> New Match
                </Button>
            </div>
        </RetroPanel>
    );

    const gameOverModalNode = gameOverMsg ? (
        <RetroPanel woodStyle="parchment" padding="large" className="game-over-modal slide-in">
            <div className="gold-frame-inner">
                <h1 className="game-over-title">Match Concluded</h1>
                <div className="retro-divider" style={{ width: '60%', margin: '1rem auto' }} />
                <h2 className="game-over-text">{gameOverMsg.split('\n').map((line, i) => <div key={i}>{line}</div>)}</h2>

                <div className="modal-actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <Button onClick={restartGame} variant="primary" fullWidth>Play Again</Button>
                    <Button onClick={() => navigate('/')} variant="secondary" fullWidth>Return to Lobby</Button>
                </div>
            </div>
        </RetroPanel>
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

export default CheckersGame;

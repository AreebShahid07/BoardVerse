import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Reversi, P1, P2 } from './engine';
import { getBestReversiMove } from '../../ai/reversiBot/engine';
import { recordGameResult } from '../../utils/storage';
import { playMoveSound, playCaptureSound } from '../../utils/sounds';
import ReversiBoard from './ReversiBoard';
import RetroPanel from '../../components/RetroPanel';
import Button from '../../components/Button';
import '../../pages/ChessGame.css'; // Reuse 3-column classical layout styles

const ReversiGame = () => {
    const navigate = useNavigate();
    const [engine, setEngine] = useState(new Reversi());
    const [boardWidth, setBoardWidth] = useState(550);
    const [gameMode, setGameMode] = useState('bot'); // 'bot' or 'local'
    const [botLevel, setBotLevel] = useState(3);
    const [botIsThinking, setBotIsThinking] = useState(false);
    const [gameOverMsg, setGameOverMsg] = useState('');
    const [moveHistory, setMoveHistory] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Responsive board (matches Chess/Checkers perfectly)
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

    // Notation helper
    const colNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const getNotation = (r, c) => `${colNames[c]}${8 - r}`;

    // Game Over Check
    useEffect(() => {
        const status = engine.isGameOver();
        if (status.over) {
            let msg = 'Match Concluded';
            let winner = 'reversi';

            if (status.winner === P1) {
                msg = `Victory!\nBlack Wins (${status.p1Count} to ${status.p2Count})`;
                winner = 'player';
            } else if (status.winner === P2) {
                msg = `Victory!\nWhite Wins (${status.p2Count} to ${status.p1Count})`;
                winner = gameMode === 'bot' ? 'bot' : 'player';
            } else {
                msg = `Draw\nScores Tied at ${status.p1Count}`;
            }

            setGameOverMsg(msg);
            recordGameResult(winner, 'reversi');
        }
    }, [engine.board, gameMode]);

    // Bot Move
    const makeBotMove = useCallback(() => {
        if (engine.isGameOver().over || gameOverMsg) return;

        setBotIsThinking(true);
        setTimeout(() => {
            const bestMove = getBestReversiMove(engine, botLevel);
            if (bestMove) {
                const newEngine = new Reversi(engine.board, engine.currentTurn);
                const { success, flippedCount } = newEngine.move(bestMove.r, bestMove.c);

                if (success) {
                    if (soundEnabled) {
                        if (flippedCount > 2) playCaptureSound(); // Bigger sound for big flips
                        else playMoveSound();
                    }

                    const notation = `W: ${getNotation(bestMove.r, bestMove.c)} (+${flippedCount})`;
                    setMoveHistory(prev => [...prev, notation]);
                    setEngine(newEngine);
                }
            } else {
                // Should not happen unless bot must pass, but move/switch logic handles no-move passes internally before turn reaches here
            }
            setBotIsThinking(false);
        }, 600);
    }, [engine, botLevel, soundEnabled, gameOverMsg]);

    // Handle Bot Turns
    useEffect(() => {
        if (gameMode === 'bot' && engine.currentTurn === P2 && !engine.isGameOver().over && !botIsThinking) {
            makeBotMove();
        }
    }, [engine.currentTurn, gameMode, botIsThinking, makeBotMove]);

    // Player Move
    const handleSquareClick = (r, c) => {
        if (gameOverMsg || (gameMode === 'bot' && engine.currentTurn === P2)) return;

        const newEngine = new Reversi(engine.board, engine.currentTurn);
        const { success, flippedCount } = newEngine.move(r, c);

        if (success) {
            if (soundEnabled) {
                if (flippedCount > 2) playCaptureSound();
                else playMoveSound();
            }

            const prefix = engine.currentTurn === P1 ? 'B: ' : 'W: ';
            const notation = `${prefix}${getNotation(r, c)} (+${flippedCount})`;
            setMoveHistory(prev => [...prev, notation]);
            setEngine(newEngine);
        }
    };

    const restartGame = () => {
        setEngine(new Reversi());
        setGameOverMsg('');
        setMoveHistory([]);
        setBotIsThinking(false);
    };

    // Calculate valid moves for current player to pass to Board for hinting
    const validMoves = engine.getAllValidMovesForPlayer(engine.currentTurn);

    // Convert history array to pairs for the UI
    const historyPairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        historyPairs.push([moveHistory[i], moveHistory[i + 1]]);
    }

    const { p1Count, p2Count } = engine.countPieces();

    return (
        <div className="chess-container fade-in">
            <div className="chess-layout">

                {/* Left: History & Score */}
                <div className="history-section">
                    <RetroPanel title="Notation & Score" woodStyle="parchment" padding="small" className="history-panel">
                        <div style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.2rem', padding: '10px 0', borderBottom: '1px solid #d4b483', marginBottom: '10px' }}>
                            <span style={{ color: '#000' }}>Black: {p1Count}</span>
                            {'  |  '}
                            <span style={{ color: '#666' }}>White: {p2Count}</span>
                        </div>
                        <div className="history-list">
                            {historyPairs.length === 0 ? (
                                <div className="history-empty">Notebook empty...</div>
                            ) : (
                                historyPairs.map((pair, idx) => (
                                    <div key={idx} className="history-row">
                                        <span className="history-number">{idx + 1}.</span>
                                        <span className="history-white">{pair[0]}</span>
                                        <span className="history-black">{pair[1] || ''}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </RetroPanel>
                </div>

                {/* Center: Board */}
                <div className="board-section">
                    <div className="game-status-bar">
                        {botIsThinking ? (
                            <span className="turn-indicator bot-thinking">Automaton pondering...</span>
                        ) : (
                            <span className={`turn-indicator ${engine.currentTurn === P1 ? 'active-w' : 'active-b'}`}>
                                {engine.currentTurn === P1 ? 'Black to move' : 'White to move'}
                            </span>
                        )}
                    </div>

                    <ReversiBoard
                        board={engine.board}
                        onSquareClick={handleSquareClick}
                        validMoves={validMoves}
                        boardWidth={boardWidth}
                    />
                </div>

                {/* Right: Controls */}
                <div className="controls-section">
                    <RetroPanel title="Controls" woodStyle="dark" padding="normal" className="settings-panel">
                        <div className="control-group">
                            <label>Opponent:</label>
                            <div className="mode-selector">
                                <Button
                                    variant={gameMode === 'bot' ? 'primary' : 'secondary'}
                                    onClick={() => setGameMode('bot')}
                                    disabled={moveHistory.length > 0}
                                >
                                    <span className="btn-icon">⚙️</span> Automaton
                                </Button>
                                <Button
                                    variant={gameMode === 'local' ? 'primary' : 'secondary'}
                                    onClick={() => setGameMode('local')}
                                    disabled={moveHistory.length > 0}
                                >
                                    <span className="btn-icon">👤</span> Local Peer
                                </Button>
                            </div>
                        </div>

                        {gameMode === 'bot' && (
                            <div className="control-group">
                                <label>Difficulty (1-5): {botLevel}</label>
                                <input
                                    type="range"
                                    min="1" max="5"
                                    value={botLevel}
                                    onChange={(e) => setBotLevel(parseInt(e.target.value))}
                                    disabled={moveHistory.length > 0}
                                    className="vintage-slider"
                                />
                            </div>
                        )}

                        <div className="control-actions">
                            <Button onClick={() => setSoundEnabled(!soundEnabled)} variant="secondary" fullWidth>
                                <span className="btn-icon">{soundEnabled ? '🔊' : '🔇'}</span> Toggle Sound
                            </Button>
                            <Button onClick={restartGame} variant="primary" fullWidth>
                                <span className="btn-icon">↻</span> New Match
                            </Button>
                        </div>
                    </RetroPanel>
                </div>

            </div>

            {/* Game Over Modal */}
            {gameOverMsg && (
                <div className="game-over-modal-overlay">
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
                </div>
            )}
        </div>
    );
};

export default ReversiGame;

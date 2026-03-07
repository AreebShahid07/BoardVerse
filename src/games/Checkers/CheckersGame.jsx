import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkers, P1, P2, P1_KING, P2_KING, EMPTY } from '../../games/Checkers/engine';
import { getBestCheckersMove } from '../../ai/checkersBot/engine';
import { recordGameResult } from '../../utils/storage';
import { playMoveSound, playCaptureSound } from '../../utils/sounds';
import CheckersBoard from '../../games/Checkers/CheckersBoard';
import RetroPanel from '../../components/RetroPanel';
import Button from '../../components/Button';
import '../../pages/ChessGame.css'; // Reuse 3-column classical layout styles

const CheckersGame = () => {
    const navigate = useNavigate();
    const [engine, setEngine] = useState(new Checkers());
    const [gameMode, setGameMode] = useState('bot');
    const [botLevel, setBotLevel] = useState(3);
    const [botIsThinking, setBotIsThinking] = useState(false);
    const [gameOverMsg, setGameOverMsg] = useState('');
    const [moveHistory, setMoveHistory] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [boardWidth, setBoardWidth] = useState(550);

    // Responsive board (matches ChessGame perfectly)
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

    // UI Selection State
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validJumpsFromSelected, setValidJumpsFromSelected] = useState(null); // Used when multiple jumps required

    // Notation helper
    const colNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const getNotation = (r, c) => `${colNames[c]}${8 - r}`;

    useEffect(() => {
        const status = engine.isGameOver();
        if (status.over) {
            let msg = 'Match Concluded';
            let winner = 'checkers';

            if (status.winner === P1) {
                msg = `Victory!\nRed (Player 1) Wins`;
                winner = 'player';
            } else if (status.winner === P2) {
                msg = `Victory!\nBlack Wins`;
                winner = gameMode === 'bot' ? 'bot' : 'player';
            }

            setGameOverMsg(msg);
            recordGameResult(winner, 'checkers');
            // Note: we need to update storage.js to accept 'checkers' as game type
        }
    }, [engine.board, gameMode]);

    const makeBotMove = useCallback(() => {
        if (engine.isGameOver().over || gameOverMsg) return;

        setBotIsThinking(true);
        setTimeout(() => {
            const bestMove = getBestCheckersMove(engine, botLevel);
            if (bestMove) {
                // Build new engine instance to trigger React render
                const newEngine = new Checkers(engine.board, engine.currentTurn);
                const { captured, multipleJumpPossible } = newEngine.move(
                    bestMove.from.r, bestMove.from.c,
                    bestMove.to.r, bestMove.to.c
                );

                if (soundEnabled) {
                    if (captured) playCaptureSound();
                    else playMoveSound();
                }

                const notation = `${getNotation(bestMove.from.r, bestMove.from.c)}${captured ? 'x' : '-'}${getNotation(bestMove.to.r, bestMove.to.c)}`;
                setMoveHistory(prev => [...prev, notation]);
                setEngine(newEngine);

                // If bot has multiple jumps, evaluate immediately
                if (multipleJumpPossible) {
                    makeBotMove(); // recursive schedule
                }
            }
            setBotIsThinking(false);
        }, 600);
    }, [engine, botLevel, soundEnabled, gameOverMsg]);

    useEffect(() => {
        if (gameMode === 'bot' && engine.currentTurn === P2 && !engine.isGameOver().over && !botIsThinking) {
            makeBotMove();
        }
    }, [engine.currentTurn, gameMode, botIsThinking, makeBotMove]);

    const handleSquareClick = (r, c) => {
        if (gameOverMsg || (gameMode === 'bot' && engine.currentTurn === P2)) return;

        const piece = engine.board[r][c];

        // Selecting a piece
        if (engine.currentTurn === P1 && (piece === P1 || piece === P1_KING)) {
            if (validJumpsFromSelected) {
                // Still making a multi-jump, can't change piece
                if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                    // Allow re-click to just show selection
                    return;
                } else {
                    return;
                }
            }
            setSelectedSquare({ r, c });
            return;
        }

        // Selecting empty square to move towards
        if (selectedSquare && piece === EMPTY) {
            const validMoves = engine.getAllValidMovesForPlayer(engine.currentTurn);
            const move = validMoves.find(m =>
                m.from.r === selectedSquare.r && m.from.c === selectedSquare.c &&
                m.to.r === r && m.to.c === c
            );

            if (move) {
                const newEngine = new Checkers(engine.board, engine.currentTurn);
                const { captured, multipleJumpPossible } = newEngine.move(
                    selectedSquare.r, selectedSquare.c, r, c
                );

                if (soundEnabled) {
                    if (captured) playCaptureSound();
                    else playMoveSound();
                }

                const notation = `${getNotation(selectedSquare.r, selectedSquare.c)}${captured ? 'x' : '-'}${getNotation(r, c)}`;

                if (multipleJumpPossible) {
                    setSelectedSquare({ r, c });
                    setValidJumpsFromSelected(true);
                } else {
                    setSelectedSquare(null);
                    setValidJumpsFromSelected(null);
                    setMoveHistory(prev => [...prev, notation]); // Append turn history only on sequence end for simplicity
                }

                setEngine(newEngine);
            }
        }
    };

    const restartGame = () => {
        setEngine(new Checkers());
        setGameOverMsg('');
        setMoveHistory([]);
        setSelectedSquare(null);
        setValidJumpsFromSelected(null);
        setBotIsThinking(false);
    };

    // Convert history array to pairs for the UI
    const historyPairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        historyPairs.push([moveHistory[i], moveHistory[i + 1]]);
    }

    return (
        <div className="chess-container fade-in">
            <div className="chess-layout">

                {/* Left: History */}
                <div className="history-section">
                    <RetroPanel title="Notation" woodStyle="parchment" padding="small" className="history-panel">
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
                                {engine.currentTurn === P1 ? 'Red to move' : 'Black to move'}
                                {validJumpsFromSelected && ' (Jump Required)'}
                            </span>
                        )}
                    </div>

                    <CheckersBoard
                        board={engine.board}
                        onSquareClick={handleSquareClick}
                        selectedSquare={selectedSquare}
                        turn={engine.currentTurn}
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

export default CheckersGame;

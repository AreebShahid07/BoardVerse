import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useNavigate } from 'react-router-dom';
import { getBestMove } from '../ai/chessBot/engine';
import { recordGameResult } from '../utils/storage';
import { playMoveSound, playCaptureSound } from '../utils/sounds';
import RetroPanel from '../components/RetroPanel';
import Button from '../components/Button';
import './ChessGame.css';

const ChessGame = () => {
    const navigate = useNavigate();
    const [game, setGame] = useState(new Chess());
    const [boardWidth, setBoardWidth] = useState(500);
    const [gameMode, setGameMode] = useState('bot'); // 'bot' or 'local'
    const [botLevel, setBotLevel] = useState(1);
    const [botIsThinking, setBotIsThinking] = useState(false);
    const [gameOverMsg, setGameOverMsg] = useState('');
    const [moveHistory, setMoveHistory] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(true);

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

    // Check Game Over
    useEffect(() => {
        if (game.isGameOver()) {
            let msg = 'Match Concluded';
            let winner = 'chess';

            if (game.isCheckmate()) {
                const turnText = game.turn() === 'w' ? 'Black' : 'White';
                msg = `Checkmate\n${turnText} Wins`;
                if (gameMode === 'bot') {
                    winner = game.turn() === 'w' ? 'bot' : 'player';
                } else {
                    winner = 'player';
                }
            } else if (game.isDraw()) {
                msg = 'Draw';
            } else if (game.isStalemate()) {
                msg = 'Stalemate';
            }

            setGameOverMsg(msg);
            recordGameResult(winner);
        }
    }, [game.fen(), gameMode]);

    // Make a move
    const makeAMove = useCallback((move) => {
        try {
            const gameCopy = new Chess(game.fen());
            const result = gameCopy.move(move);

            if (result) {
                setGame(gameCopy);
                setMoveHistory(gameCopy.history());

                if (soundEnabled) {
                    if (result.captured) playCaptureSound();
                    else playMoveSound();
                }
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }, [game, soundEnabled]);

    // Handle Bot Turn via useEffect
    useEffect(() => {
        let timeoutId;
        if (gameMode === 'bot' && game.turn() === 'b' && !game.isGameOver()) {
            setBotIsThinking(true);
            timeoutId = setTimeout(() => {
                const bestMove = getBestMove(game, botLevel);
                if (bestMove) {
                    makeAMove(bestMove);
                }
                setBotIsThinking(false);
            }, 500);
        }
        return () => clearTimeout(timeoutId);
    }, [game.fen(), gameMode, botLevel, makeAMove]);

    // Handle Player Move
    const onDrop = (sourceSquare, targetSquare, piece) => {
        if (gameOverMsg || (gameMode === 'bot' && game.turn() === 'b')) return false;

        const move = {
            from: sourceSquare,
            to: targetSquare,
            promotion: piece[1].toLowerCase() ?? 'q',
        };

        const isLegal = makeAMove(move);
        return isLegal;
    };

    const restartGame = () => {
        setGame(new Chess());
        setGameOverMsg('');
        setMoveHistory([]);
        setBotIsThinking(false);
    };

    const undoMove = () => {
        if (gameMode === 'bot' && moveHistory.length >= 2) {
            const gameCopy = new Chess(game.fen());
            gameCopy.undo(); // Bot's move
            gameCopy.undo(); // Player's move
            setGame(gameCopy);
            setMoveHistory(gameCopy.history());
        } else if (gameMode === 'local' && moveHistory.length >= 1) {
            const gameCopy = new Chess(game.fen());
            gameCopy.undo();
            setGame(gameCopy);
            setMoveHistory(gameCopy.history());
        }
        setGameOverMsg('');
    };

    // Turn History array into pairs for notation rendering
    const historyPairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        historyPairs.push([moveHistory[i], moveHistory[i + 1]]);
    }

    const customBoardStyle = {
        borderRadius: '4px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
    };

    const customDarkSquareStyle = { backgroundColor: '#5c3b21' }; // Sepia wood panel color
    const customLightSquareStyle = { backgroundColor: '#d4b483' }; // Antique Gold / Lighter wood

    return (
        <div className="chess-container fade-in">
            <div className="chess-layout">

                {/* Left Column: Move History */}
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

                {/* Center Column: The Board */}
                <div className="board-section">
                    <div className="game-status-bar">
                        {botIsThinking ? (
                            <span className="turn-indicator bot-thinking">Automaton pondering...</span>
                        ) : (
                            <span className={`turn-indicator ${game.turn() === 'w' ? 'active-w' : 'active-b'}`}>
                                {game.turn() === 'w' ? 'White to move' : 'Black to move'}
                            </span>
                        )}
                    </div>

                    <div className="board-wrapper-retro">
                        <Chessboard
                            id="BoardVerse"
                            position={game.fen()}
                            onPieceDrop={onDrop}
                            boardWidth={boardWidth}
                            customBoardStyle={customBoardStyle}
                            customDarkSquareStyle={customDarkSquareStyle}
                            customLightSquareStyle={customLightSquareStyle}
                            animationDuration={300}
                        />
                    </div>
                </div>

                {/* Right Column: Game Controls */}
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
                            <Button onClick={undoMove} variant="secondary" fullWidth disabled={moveHistory.length === 0}>
                                <span className="btn-icon">↶</span> Retract Move
                            </Button>
                            <Button onClick={restartGame} variant="primary" fullWidth>
                                <span className="btn-icon">↻</span> New Match
                            </Button>
                        </div>

                    </RetroPanel>
                </div>

            </div>

            {gameOverMsg && (
                <div className="game-over-modal-overlay">
                    <RetroPanel woodStyle="parchment" padding="large" className="game-over-modal slide-in">
                        <div className="gold-frame-inner">
                            <h1 className="game-over-title">Victory!</h1>
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

export default ChessGame;

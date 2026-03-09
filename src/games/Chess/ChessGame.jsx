import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { useNavigate } from 'react-router-dom';
import { useChessGame } from './useChessGame';
import GameBoardLayout from '../../components/GameBoardLayout';
import RetroPanel from '../../components/RetroPanel';
import Button from '../../components/Button';
import GameOverModal from '../../components/GameOverModal';
import { Bot, User, Volume2, VolumeX, RotateCcw, Undo2 } from 'lucide-react';
import styles from './ChessGame.module.css';

const ChessGame = () => {
    const navigate = useNavigate();
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [boardWidth, setBoardWidth] = useState(() => {
        if (typeof window !== 'undefined') {
            const w = window.innerWidth;
            if (w < 800) return w - 60;
            if (w < 1100) return 400;
        }
        return 550;
    });

    const {
        game, gameMode, setGameMode, botLevel, setBotLevel,
        botIsThinking, gameOverTitle, gameOverMsg, moveHistory, moveFrom,
        onDrop, onSquareClick, restartGame, undoMove
    } = useChessGame(soundEnabled);

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

    // Turn History array into pairs for notation rendering
    const historyPairs = React.useMemo(() => {
        const pairs = [];
        for (let i = 0; i < moveHistory.length; i += 2) {
            pairs.push([moveHistory[i], moveHistory[i + 1]]);
        }
        return pairs;
    }, [moveHistory]);

    const customBoardStyle = {
        borderRadius: '4px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
    };
    const customDarkSquareStyle = { backgroundColor: '#5c3b21' };
    const customLightSquareStyle = { backgroundColor: '#d4b483' };

    // Calculate possible moves for the selected piece
    const possibleMoves = React.useMemo(() => {
        if (!moveFrom) return [];
        return game.moves({ square: moveFrom, verbose: true }).map(m => m.to);
    }, [game.fen(), moveFrom]);

    // Build customSquareStyles for highlighting
    const currentSquareStyles = React.useMemo(() => {
        const styles = {};
        if (moveFrom) {
            styles[moveFrom] = {
                backgroundColor: 'rgba(212, 180, 131, 0.45)',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
            };
            possibleMoves.forEach(sq => {
                styles[sq] = {
                    background: game.get(sq) && game.get(sq).color !== game.turn()
                        ? 'radial-gradient(circle, rgba(0,0,0,.2) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)',
                    borderRadius: '50%'
                };
            });
        }
        return styles;
    }, [moveFrom, possibleMoves, game]);

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
                <span className={`turn-indicator ${game.turn() === 'w' ? 'active-w' : 'active-b'}`}>
                    {game.turn() === 'w' ? 'White to move' : 'Black to move'}
                </span>
            )}
        </>
    );

    const centerBoard = (
        <div className={styles.boardWrapperRetro}>
            <Chessboard
                id="BoardVerse"
                position={game.fen()}
                onPieceDrop={onDrop}
                onSquareClick={onSquareClick}
                boardWidth={boardWidth}
                customBoardStyle={customBoardStyle}
                customDarkSquareStyle={customDarkSquareStyle}
                customLightSquareStyle={customLightSquareStyle}
                customSquareStyles={currentSquareStyles}
                animationDuration={300}
            />
        </div>
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

export default ChessGame;

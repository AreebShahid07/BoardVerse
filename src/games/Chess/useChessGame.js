import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import { getBestMove } from '../../ai/chessBot/engine';
import { recordGameResult } from '../../utils/storage';
import { playMoveSound, playCaptureSound } from '../../utils/sounds';

export const useChessGame = (soundEnabled) => {
    const [game, setGame] = useState(new Chess());
    const [gameMode, setGameMode] = useState('bot');
    const [botLevel, setBotLevel] = useState(1);
    const [botIsThinking, setBotIsThinking] = useState(false);
    const [gameOverMsg, setGameOverMsg] = useState('');
    const [gameOverTitle, setGameOverTitle] = useState('');
    const [moveHistory, setMoveHistory] = useState([]);
    const [moveFrom, setMoveFrom] = useState('');
    const gameRecorded = useRef(false);

    // Check Game Over
    useEffect(() => {
        if (game.isGameOver() && !gameRecorded.current) {
            let title = 'Match Concluded';
            let msg = '';
            let winner = 'chess';

            if (game.isCheckmate()) {
                const winnerColor = game.turn() === 'w' ? 'Black' : 'White';
                const isPlayerWin = gameMode === 'bot'
                    ? game.turn() === 'b'
                    : true;
                title = isPlayerWin || gameMode === 'local' ? 'Victory!' : 'Defeat';
                msg = `Checkmate — ${winnerColor} Wins`;
                winner = gameMode === 'bot' ? (game.turn() === 'w' ? 'bot' : 'player') : 'player';
            } else if (game.isDraw()) {
                title = 'Draw';
                winner = 'draw';
                if (game.isStalemate()) {
                    msg = 'Stalemate — No legal moves';
                } else if (game.isThreefoldRepetition()) {
                    msg = 'Threefold Repetition';
                } else if (game.isInsufficientMaterial()) {
                    msg = 'Insufficient Material';
                } else {
                    msg = '50-Move Rule';
                }
            }

            setGameOverTitle(title);
            setGameOverMsg(msg);
            recordGameResult(winner, 'chess');
            gameRecorded.current = true;
        }
    }, [game, gameMode]);

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
                if (bestMove) makeAMove(bestMove);
                setBotIsThinking(false);
            }, 500);
        }
        return () => clearTimeout(timeoutId);
    }, [game.fen(), gameMode, botLevel, makeAMove]);

    // Handle Player Move (Drag)
    const onDrop = (sourceSquare, targetSquare, piece) => {
        if (gameOverMsg || (gameMode === 'bot' && game.turn() === 'b')) return false;
        const move = {
            from: sourceSquare,
            to: targetSquare,
            promotion: piece[1].toLowerCase() ?? 'q',
        };
        const success = makeAMove(move);
        if (success) setMoveFrom('');
        return success;
    };

    // Handle Player Move (Click)
    const onSquareClick = (square) => {
        if (gameOverMsg || (gameMode === 'bot' && game.turn() === 'b')) return;

        // If no piece is selected, select the piece if it belongs to the current player
        if (!moveFrom) {
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                setMoveFrom(square);
            }
            return;
        }

        // Attempting to move
        const move = {
            from: moveFrom,
            to: square,
            promotion: 'q',
        };

        const success = makeAMove(move);

        // If invalid move (e.g., clicking own piece), change selection. Else clear selection.
        if (!success) {
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                setMoveFrom(square);
            } else {
                setMoveFrom('');
            }
        } else {
            setMoveFrom('');
        }
    };

    const restartGame = () => {
        setGame(new Chess());
        setGameOverMsg('');
        setGameOverTitle('');
        setMoveHistory([]);
        setMoveFrom('');
        setBotIsThinking(false);
        gameRecorded.current = false;
    };

    const undoMove = () => {
        if (gameMode === 'bot' && moveHistory.length >= 2) {
            const gameCopy = new Chess(game.fen());
            gameCopy.undo(); gameCopy.undo();
            setGame(gameCopy);
            setMoveHistory(gameCopy.history());
        } else if (gameMode === 'local' && moveHistory.length >= 1) {
            const gameCopy = new Chess(game.fen());
            gameCopy.undo();
            setGame(gameCopy);
            setMoveHistory(gameCopy.history());
        }
        setGameOverMsg('');
        setGameOverTitle('');
        gameRecorded.current = false;
    };

    return {
        game, gameMode, setGameMode, botLevel, setBotLevel,
        botIsThinking, gameOverTitle, gameOverMsg, moveHistory, moveFrom,
        onDrop, onSquareClick, restartGame, undoMove
    };
};

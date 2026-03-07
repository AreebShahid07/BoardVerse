import { useState, useEffect, useCallback } from 'react';
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
    const [moveHistory, setMoveHistory] = useState([]);
    const [moveFrom, setMoveFrom] = useState('');

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
        setMoveHistory([]);
        setMoveFrom('');
        setBotIsThinking(false);
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
    };

    return {
        game, gameMode, setGameMode, botLevel, setBotLevel,
        botIsThinking, gameOverMsg, moveHistory, moveFrom,
        onDrop, onSquareClick, restartGame, undoMove
    };
};

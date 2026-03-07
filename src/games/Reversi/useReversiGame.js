import { useState, useEffect, useCallback } from 'react';
import { Reversi, P1, P2 } from './engine';
import { getBestReversiMove } from '../../ai/reversiBot/engine';
import { recordGameResult } from '../../utils/storage';
import { playMoveSound, playCaptureSound } from '../../utils/sounds';

export const useReversiGame = (soundEnabled) => {
    const [engine, setEngine] = useState(new Reversi());
    const [gameMode, setGameMode] = useState('bot');
    const [botLevel, setBotLevel] = useState(3);
    const [botIsThinking, setBotIsThinking] = useState(false);
    const [gameOverMsg, setGameOverMsg] = useState('');
    const [moveHistory, setMoveHistory] = useState([]);

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
                        if (flippedCount > 2) playCaptureSound();
                        else playMoveSound();
                    }

                    const notation = `W: ${getNotation(bestMove.r, bestMove.c)} (+${flippedCount})`;
                    setMoveHistory(prev => [...prev, notation]);
                    setEngine(newEngine);
                }
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

    const validMoves = engine.getAllValidMovesForPlayer(engine.currentTurn);
    const { p1Count, p2Count } = engine.countPieces();

    return {
        engine, gameMode, setGameMode, botLevel, setBotLevel,
        botIsThinking, gameOverMsg, moveHistory,
        handleSquareClick, restartGame, validMoves, p1Count, p2Count
    };
};

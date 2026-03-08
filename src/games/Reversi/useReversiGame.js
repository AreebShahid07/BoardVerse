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
    const [gameOverTitle, setGameOverTitle] = useState('');
    const [moveHistory, setMoveHistory] = useState([]);
    const [engineHistory, setEngineHistory] = useState([]);

    const colNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const getNotation = (r, c) => `${colNames[c]}${8 - r}`;

    // Game Over Check
    useEffect(() => {
        const status = engine.isGameOver();
        if (status.over) {
            let title = 'Match Concluded';
            let msg = '';
            let winner = 'reversi';

            if (status.winner === P1) {
                title = 'Victory!';
                msg = `Black (Human) Wins — ${status.p1Count} to ${status.p2Count}`;
                winner = 'player';
            } else if (status.winner === P2) {
                const isPlayerWin = gameMode !== 'bot';
                title = isPlayerWin ? 'Victory!' : 'Defeat';
                msg = `White ${isPlayerWin ? '(Human)' : '(Automaton)'} Wins — ${status.p2Count} to ${status.p1Count}`;
                winner = gameMode === 'bot' ? 'bot' : 'player';
            } else {
                title = 'Draw';
                msg = `Scores are tied at ${status.p1Count}`;
            }

            setGameOverTitle(title);
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

                    setEngineHistory(prev => [...prev, { board: engine.board, turn: engine.currentTurn, history: moveHistory }]);
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

            setEngineHistory(prev => [...prev, { board: engine.board, turn: engine.currentTurn, history: moveHistory }]);
            const prefix = engine.currentTurn === P1 ? 'B: ' : 'W: ';
            const notation = `${prefix}${getNotation(r, c)} (+${flippedCount})`;
            setMoveHistory(prev => [...prev, notation]);
            setEngine(newEngine);
        }
    };

    const restartGame = () => {
        setEngine(new Reversi());
        setGameOverMsg('');
        setGameOverTitle('');
        setMoveHistory([]);
        setEngineHistory([]);
        setBotIsThinking(false);
    };

    const undoMove = () => {
        if (engineHistory.length === 0 || botIsThinking) return;

        let stepsToUndo = (gameMode === 'bot') ? 2 : 1;
        if (engineHistory.length < stepsToUndo) stepsToUndo = engineHistory.length;

        const newHistory = [...engineHistory];
        let lastState;
        for (let i = 0; i < stepsToUndo; i++) {
            lastState = newHistory.pop();
        }

        setEngine(new Reversi(lastState.board, lastState.turn));
        setMoveHistory(lastState.history);
        setEngineHistory(newHistory);
        setGameOverMsg('');
        setGameOverTitle('');
    };

    const validMoves = engine.getAllValidMovesForPlayer(engine.currentTurn);
    const { p1Count, p2Count } = engine.countPieces();

    return {
        engine, gameMode, setGameMode, botLevel, setBotLevel,
        botIsThinking, gameOverTitle, gameOverMsg, moveHistory,
        handleSquareClick, restartGame, undoMove, validMoves, p1Count, p2Count
    };
};

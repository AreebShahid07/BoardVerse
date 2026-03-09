import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Checkers, P1, P2, P1_KING, EMPTY } from './engine';
import { getBestCheckersMove } from '../../ai/checkersBot/engine';
import { recordGameResult } from '../../utils/storage';
import { playMoveSound, playCaptureSound } from '../../utils/sounds';

export const useCheckersGame = (soundEnabled) => {
    const [engine, setEngine] = useState(new Checkers());
    const [gameMode, setGameMode] = useState('bot');
    const [botLevel, setBotLevel] = useState(3);
    const [botIsThinking, setBotIsThinking] = useState(false);
    const [gameOverMsg, setGameOverMsg] = useState('');
    const [gameOverTitle, setGameOverTitle] = useState('');
    const [moveHistory, setMoveHistory] = useState([]);

    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validJumpsFromSelected, setValidJumpsFromSelected] = useState(null);
    const [engineHistory, setEngineHistory] = useState([]);
    const gameRecorded = useRef(false);

    const colNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const getNotation = (r, c) => `${colNames[c]}${8 - r}`;

    useEffect(() => {
        const status = engine.isGameOver();
        if (status.over && !gameRecorded.current) {
            let title = 'Match Concluded';
            let msg = '';
            let winner = 'checkers';

            if (status.winner === P1) {
                title = 'Victory!';
                msg = `Red (Human) Wins the Match`;
                winner = 'player';
            } else if (status.winner === P2) {
                const isPlayerWin = gameMode !== 'bot';
                title = isPlayerWin ? 'Victory!' : 'Defeat';
                msg = `Black ${isPlayerWin ? '(Human)' : '(Automaton)'} Wins the Match`;
                winner = gameMode === 'bot' ? 'bot' : 'player';
            } else {
                title = 'Draw';
                msg = 'The board is locked, or no pieces remain.';
            }

            setGameOverTitle(title);
            setGameOverMsg(msg);
            recordGameResult(winner, 'checkers');
            gameRecorded.current = true;
        }
    }, [engine.board, gameMode]);

    const makeBotMove = useCallback(() => {
        if (engine.isGameOver().over || gameOverMsg) return;

        setBotIsThinking(true);
        setTimeout(() => {
            const bestMove = getBestCheckersMove(engine, botLevel);
            if (bestMove) {
                const newEngine = new Checkers(engine.board, engine.currentTurn);
                const { captured, multipleJumpPossible } = newEngine.move(
                    bestMove.from.r, bestMove.from.c,
                    bestMove.to.r, bestMove.to.c
                );

                if (soundEnabled) {
                    if (captured) playCaptureSound();
                    else playMoveSound();
                }

                setEngineHistory(prev => [...prev, { board: engine.board, turn: engine.currentTurn, history: moveHistory }]);
                const notation = `${getNotation(bestMove.from.r, bestMove.from.c)}${captured ? 'x' : '-'}${getNotation(bestMove.to.r, bestMove.to.c)}`;
                setMoveHistory(prev => [...prev, notation]);
                setEngine(newEngine);

                if (multipleJumpPossible) {
                    makeBotMove();
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

        if (engine.currentTurn === P1 && (piece === P1 || piece === P1_KING)) {
            if (validJumpsFromSelected) {
                if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                    return;
                } else {
                    return;
                }
            }
            setSelectedSquare({ r, c });
            return;
        }

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
                    setEngineHistory(prev => [...prev, { board: engine.board, turn: engine.currentTurn, history: moveHistory }]);
                    setMoveHistory(prev => [...prev, notation]);
                }

                setEngine(newEngine);
            }
        }
    };

    const restartGame = () => {
        setEngine(new Checkers());
        setGameOverMsg('');
        setGameOverTitle('');
        setMoveHistory([]);
        setEngineHistory([]);
        setSelectedSquare(null);
        setValidJumpsFromSelected(null);
        setBotIsThinking(false);
        gameRecorded.current = false;
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

        setEngine(new Checkers(lastState.board, lastState.turn));
        setMoveHistory(lastState.history);
        setEngineHistory(newHistory);
        setGameOverMsg('');
        setGameOverTitle('');
        setSelectedSquare(null);
        setValidJumpsFromSelected(null);
        gameRecorded.current = false;
    };

    return {
        engine, gameMode, setGameMode, botLevel, setBotLevel,
        botIsThinking, gameOverTitle, gameOverMsg, moveHistory,
        selectedSquare, validJumpsFromSelected,
        handleSquareClick, restartGame, undoMove
    };
};

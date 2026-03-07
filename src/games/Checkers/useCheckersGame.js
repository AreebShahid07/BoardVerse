import { useState, useEffect, useCallback } from 'react';
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
    const [moveHistory, setMoveHistory] = useState([]);

    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validJumpsFromSelected, setValidJumpsFromSelected] = useState(null);

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
                    setMoveHistory(prev => [...prev, notation]);
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

    return {
        engine, gameMode, setGameMode, botLevel, setBotLevel,
        botIsThinking, gameOverMsg, moveHistory,
        selectedSquare, validJumpsFromSelected,
        handleSquareClick, restartGame
    };
};

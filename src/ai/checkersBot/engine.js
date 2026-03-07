import { Checkers, P1, P2, P1_KING, P2_KING, EMPTY } from '../../games/Checkers/engine';

const PIECE_VALUES = {
    [P1]: 10,
    [P2]: -10,
    [P1_KING]: 25,
    [P2_KING]: -25
};

// Evaluate board for P2 (Bot). Positive score = good for P2
const evaluateBoard = (engine) => {
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = engine.board[r][c];
            if (p !== EMPTY) {
                // Evaluate purely from P2's perspective (P2 is maximizing in this eval)
                if (p === P2) score += 10;
                else if (p === P2_KING) score += 25;
                else if (p === P1) score -= 10;
                else if (p === P1_KING) score -= 25;
            }
        }
    }
    return score;
};

// Minimax with Alpha-Beta pruning
const minimax = (engine, depth, alpha, beta, isMaximizingPlayer) => {
    const gameStatus = engine.isGameOver();
    if (depth === 0 || gameStatus.over) {
        if (gameStatus.winner === P2) return 1000 + depth; // Favor faster wins
        if (gameStatus.winner === P1) return -1000 - depth;
        return evaluateBoard(engine);
    }

    const moves = engine.getAllValidMovesForPlayer(engine.currentTurn);

    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            const m = moves[i];
            const engineCopy = new Checkers(engine.board, engine.currentTurn);
            const res = engineCopy.move(m.from.r, m.from.c, m.to.r, m.to.c);

            // If multiple jump is possible, we should ideally chain it, but for simplicity in this Minimax:
            // We will just evaluate the resulting board. Handled by depth abstraction.

            // Notice: If it's still maximizing player's turn (multiple jump), we don't flip isMaximizingPlayer
            const nextIsMax = engineCopy.currentTurn === P2;

            bestVal = Math.max(bestVal, minimax(engineCopy, depth - 1, alpha, beta, nextIsMax));
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (let i = 0; i < moves.length; i++) {
            const m = moves[i];
            const engineCopy = new Checkers(engine.board, engine.currentTurn);
            engineCopy.move(m.from.r, m.from.c, m.to.r, m.to.c);

            const nextIsMax = engineCopy.currentTurn === P2;
            bestVal = Math.min(bestVal, minimax(engineCopy, depth - 1, alpha, beta, nextIsMax));
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
};

export const getBestCheckersMove = (engineInstance, level) => {
    const moves = engineInstance.getAllValidMovesForPlayer(P2);
    if (moves.length === 0) return null;

    // Level 1: Random Move
    if (level === 1) {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // Level 2: Greedy (Always take jumps if available, otherwise random)
    if (level === 2) {
        const jumps = moves.filter(m => m.isJump);
        if (jumps.length > 0) return jumps[Math.floor(Math.random() * jumps.length)];
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // Levels 3, 4, 5: Minimax Dept 1, 3, 5
    let depth = 1;
    if (level === 4) depth = 3;
    if (level === 5) depth = 5;

    let bestMove = null;
    let bestValue = -Infinity;

    // Shuffle to prevent repetitive games
    const shuffledMoves = moves.sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledMoves.length; i++) {
        const move = shuffledMoves[i];
        const engineCopy = new Checkers(engineInstance.board, engineInstance.currentTurn);
        engineCopy.move(move.from.r, move.from.c, move.to.r, move.to.c);

        // Evaluate path
        const nextIsMax = engineCopy.currentTurn === P2;
        const boardValue = minimax(engineCopy, depth - 1, -Infinity, Infinity, nextIsMax);

        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }

    return bestMove || moves[0];
};

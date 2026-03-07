import { Reversi, P1, P2, EMPTY } from '../../games/Reversi/engine';

// Evaluate board for P2 (White/Bot). Positive score = good for P2.
// In Reversi, corners are highly valuable, edges are good, squares next to corners are dangerous.
const evaluateBoard = (engine) => {
    let score = 0;
    const { p1Count, p2Count } = engine.countPieces();

    // Piece differential (weight increases slightly towards end game)
    score += (p2Count - p1Count) * 2;

    const CORNER_VALUE = 40;
    const EDGE_VALUE = 8;
    const X_SQUARE_VALUE = -15; // Diagonal to corner
    const C_SQUARE_VALUE = -8;  // Adjacent to corner

    const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
    const xSquares = [
        [[1, 1], [0, 0]], [[1, 6], [0, 7]],
        [[6, 1], [7, 0]], [[6, 6], [7, 7]]
    ];

    // Evaluate Corners
    corners.forEach(([r, c]) => {
        const p = engine.board[r][c];
        if (p === P2) score += CORNER_VALUE;
        else if (p === P1) score -= CORNER_VALUE;
    });

    // Evaluate Danger Squares (X-squares and C-squares) only if corner is empty
    xSquares.forEach(([[r, c], [cr, cc]]) => {
        if (engine.board[cr][cc] === EMPTY) {
            const p = engine.board[r][c];
            if (p === P2) score += X_SQUARE_VALUE;
            else if (p === P1) score -= X_SQUARE_VALUE;
        }
    });

    // Mobility (number of valid moves)
    const p2Moves = engine.getAllValidMovesForPlayer(P2).length;
    const p1Moves = engine.getAllValidMovesForPlayer(P1).length;
    score += (p2Moves - p1Moves) * 5;

    return score;
};

// Minimax with Alpha-Beta pruning
const minimax = (engine, depth, alpha, beta, isMaximizingPlayer) => {
    const gameStatus = engine.isGameOver();
    if (depth === 0 || gameStatus.over) {
        if (gameStatus.over) {
            if (gameStatus.winner === P2) return 10000 + depth; // Win
            if (gameStatus.winner === P1) return -10000 - depth; // Loss
            return 0; // Draw
        }
        return evaluateBoard(engine);
    }

    const currentPlayer = isMaximizingPlayer ? P2 : P1;
    let moves = engine.getAllValidMovesForPlayer(currentPlayer);

    if (moves.length === 0) {
        // Player has to pass, switch turns and keep going
        const nextIsMax = !isMaximizingPlayer;
        return minimax(engine, depth - 1, alpha, beta, nextIsMax);
    }

    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            const m = moves[i];
            const engineCopy = new Reversi(engine.board, engine.currentTurn);

            // Execute move 
            // We set currentTurn explicitly so `move()` uses correct logic
            engineCopy.currentTurn = P2;
            engineCopy.move(m.r, m.c);

            // Reversi automatically flips turns if possible in `move()`. Let's check who's next.
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
            const engineCopy = new Reversi(engine.board, engine.currentTurn);

            engineCopy.currentTurn = P1;
            engineCopy.move(m.r, m.c);

            const nextIsMax = engineCopy.currentTurn === P2;
            bestVal = Math.min(bestVal, minimax(engineCopy, depth - 1, alpha, beta, nextIsMax));
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
};

export const getBestReversiMove = (engineInstance, level) => {
    const moves = engineInstance.getAllValidMovesForPlayer(P2);
    if (moves.length === 0) return null;

    // Level 1: Random Move
    if (level === 1) {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // Level 2: Greedy (Most Flips)
    if (level === 2) {
        let bestCurrent = -1;
        let bMoves = [];
        for (let m of moves) {
            if (m.flipped.length > bestCurrent) {
                bestCurrent = m.flipped.length;
                bMoves = [m];
            } else if (m.flipped.length === bestCurrent) {
                bMoves.push(m);
            }
        }
        return bMoves[Math.floor(Math.random() * bMoves.length)];
    }

    // Levels 3, 4, 5: Minimax Dept 2, 4, 6
    let depth = 2;
    if (level === 4) depth = 4;
    if (level === 5) depth = 6;

    let bestMove = null;
    let bestValue = -Infinity;

    // Shuffle to prevent repetitive games
    const shuffledMoves = moves.sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledMoves.length; i++) {
        const move = shuffledMoves[i];
        const engineCopy = new Reversi(engineInstance.board, engineInstance.currentTurn);

        engineCopy.move(move.r, move.c);

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

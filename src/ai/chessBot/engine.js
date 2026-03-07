import { Chess } from 'chess.js';

// Basic piece values for Minimax
const PIECE_VALUES = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900
};

// Evaluate board score for a given perspective
const evaluateBoard = (chess, color) => {
    let score = 0;
    const board = chess.board();

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                let value = PIECE_VALUES[piece.type];
                if (piece.color === color) {
                    score += value;
                } else {
                    score -= value;
                }
            }
        }
    }
    return score;
};

// Minimax with Alpha-Beta pruning
const minimax = (chess, depth, alpha, beta, isMaximizingPlayer, botColor) => {
    if (depth === 0 || chess.isGameOver()) {
        return evaluateBoard(chess, botColor);
    }

    const moves = chess.moves();

    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            chess.move(moves[i]);
            bestVal = Math.max(bestVal, minimax(chess, depth - 1, alpha, beta, !isMaximizingPlayer, botColor));
            chess.undo();
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (let i = 0; i < moves.length; i++) {
            chess.move(moves[i]);
            bestVal = Math.min(bestVal, minimax(chess, depth - 1, alpha, beta, !isMaximizingPlayer, botColor));
            chess.undo();
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
};

// Main function to get the bot move based on level
export const getBestMove = (chessInstance, level) => {
    const moves = chessInstance.moves();
    if (moves.length === 0) return null;

    // Level 1: Random Move
    if (level === 1) {
        const randomIndex = Math.floor(Math.random() * moves.length);
        return moves[randomIndex];
    }

    // Level 2: Prefer Captures (Greedy)
    if (level === 2) {
        // Check for capturing moves first
        const captures = moves.filter(m => m.includes('x'));
        if (captures.length > 0) {
            const randomIndex = Math.floor(Math.random() * captures.length);
            return captures[randomIndex];
        }
        // Fallback to random
        const randomIndex = Math.floor(Math.random() * moves.length);
        return moves[randomIndex];
    }

    // Level 3, 4, 5: Minimax Depth 1, 2, 3
    let depth = 1;
    if (level === 4) depth = 2;
    if (level === 5) depth = 3;

    const botColor = chessInstance.turn();
    let bestMove = null;
    let bestValue = -Infinity;

    // Clone the board so we do not mutate React state directly!
    const searchBoard = new Chess(chessInstance.fen());

    // For depth > 1, we might want to shuffle moves to add variety among equal scores
    const shuffledMoves = searchBoard.moves().sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledMoves.length; i++) {
        const move = shuffledMoves[i];
        searchBoard.move(move);
        // Since we just moved, the next turn is the opponent (minimizing)
        const boardValue = minimax(searchBoard, depth - 1, -Infinity, Infinity, false, botColor);
        searchBoard.undo();

        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }

    return bestMove || moves[0];
};

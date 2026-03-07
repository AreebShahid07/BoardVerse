// Reversi Game Engine
// 0 = empty
// 1 = Player 1 (Black, goes first)
// 2 = Player 2 (White)

export const EMPTY = 0;
export const P1 = 1;
export const P2 = 2;

export class Reversi {
    constructor(initialBoard, turn) {
        if (initialBoard) {
            this.board = JSON.parse(JSON.stringify(initialBoard));
            this.currentTurn = turn || P1;
        } else {
            this.board = this.createInitialBoard();
            this.currentTurn = P1; // P1 (Black) always goes first
        }
    }

    createInitialBoard() {
        const b = Array(8).fill(null).map(() => Array(8).fill(EMPTY));
        // Initial setup
        b[3][3] = P2; // White
        b[3][4] = P1; // Black
        b[4][3] = P1; // Black
        b[4][4] = P2; // White
        return b;
    }

    getOpponent(player) {
        return player === P1 ? P2 : P1;
    }

    isInBounds(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }

    // Directions: N, NE, E, SE, S, SW, W, NW
    getDirections() {
        return [
            { dr: -1, dc: 0 }, { dr: -1, dc: 1 }, { dr: 0, dc: 1 }, { dr: 1, dc: 1 },
            { dr: 1, dc: 0 }, { dr: 1, dc: -1 }, { dr: 0, dc: -1 }, { dr: -1, dc: -1 }
        ];
    }

    // Checks if placing a piece at (r, c) for `player` is valid.
    // Returns array of tiles that would be flipped.
    getFlippedTiles(r, c, player) {
        if (this.board[r][c] !== EMPTY) return [];

        const opponent = this.getOpponent(player);
        const dirs = this.getDirections();
        let allFlipped = [];

        for (const dir of dirs) {
            let flippedInDir = [];
            let currR = r + dir.dr;
            let currC = c + dir.dc;

            while (this.isInBounds(currR, currC) && this.board[currR][currC] === opponent) {
                flippedInDir.push({ r: currR, c: currC });
                currR += dir.dr;
                currC += dir.dc;
            }

            // If we found opponent pieces AND sequence ends with our own piece
            if (flippedInDir.length > 0 && this.isInBounds(currR, currC) && this.board[currR][currC] === player) {
                allFlipped = allFlipped.concat(flippedInDir);
            }
        }

        return allFlipped;
    }

    // Returns array of { r, c, flipped: [] }
    getAllValidMovesForPlayer(player) {
        let moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] === EMPTY) {
                    const flipped = this.getFlippedTiles(r, c, player);
                    if (flipped.length > 0) {
                        moves.push({ r, c, flipped });
                    }
                }
            }
        }
        return moves;
    }

    hasValidMoves(player) {
        return this.getAllValidMovesForPlayer(player).length > 0;
    }

    // Returns { success: boolean, flippedCount: number }
    move(r, c) {
        const flipped = this.getFlippedTiles(r, c, this.currentTurn);
        if (flipped.length === 0) {
            return { success: false, flippedCount: 0 };
        }

        // Apply move
        this.board[r][c] = this.currentTurn;
        flipped.forEach(tile => {
            this.board[tile.r][tile.c] = this.currentTurn;
        });

        // Switch turns. If next player has no moves, skip turn.
        const opponent = this.getOpponent(this.currentTurn);
        if (this.hasValidMoves(opponent)) {
            this.currentTurn = opponent;
        } else if (!this.hasValidMoves(this.currentTurn)) {
            // Neither player has moves => game over. Handled by isGameOver()
            // We just flip the turn to signal passing if they actually had one, but if neither has one, turn doesn't matter much.
            // Leaving it as currentTurn if both are stuck.
        }

        return { success: true, flippedCount: flipped.length };
    }

    countPieces() {
        let p1Count = 0;
        let p2Count = 0;
        let emptyCount = 0;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] === P1) p1Count++;
                else if (this.board[r][c] === P2) p2Count++;
                else emptyCount++;
            }
        }

        return { p1Count, p2Count, emptyCount };
    }

    isGameOver() {
        const p1HasMoves = this.hasValidMoves(P1);
        const p2HasMoves = this.hasValidMoves(P2);

        if (!p1HasMoves && !p2HasMoves) {
            const counts = this.countPieces();
            let winner = null;
            if (counts.p1Count > counts.p2Count) winner = P1;
            else if (counts.p2Count > counts.p1Count) winner = P2;

            return { over: true, winner, ...counts };
        }

        return { over: false, winner: null };
    }

    turn() {
        return this.currentTurn;
    }
}

// Checkers Game Engine
// 0 = empty
// 1 = Player 1 (Red / Dark Wood)
// 2 = Player 2 (Black / Light Wood)
// 3 = Player 1 King
// 4 = Player 2 King

export const EMPTY = 0;
export const P1 = 1;
export const P2 = 2;
export const P1_KING = 3;
export const P2_KING = 4;

export class Checkers {
    constructor(initialBoard, turn) {
        if (initialBoard) {
            this.board = JSON.parse(JSON.stringify(initialBoard));
            this.currentTurn = turn || P1;
        } else {
            this.board = this.createInitialBoard();
            this.currentTurn = P1; // P1 always goes first
        }
    }

    createInitialBoard() {
        const b = Array(8).fill(null).map(() => Array(8).fill(EMPTY));
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                // Playable squares are dark squares: (r + c) % 2 !== 0
                if ((r + c) % 2 !== 0) {
                    if (r < 3) b[r][c] = P2; // Top 3 rows for P2
                    else if (r > 4) b[r][c] = P1; // Bottom 3 rows for P1
                }
            }
        }
        return b;
    }

    // Returns array of { r: row, c: col }
    getValidMoves(pieceR, pieceC) {
        const piece = this.board[pieceR][pieceC];
        if (piece === EMPTY) return [];

        // Check if it's correct turn
        const isP1 = piece === P1 || piece === P1_KING;
        if ((isP1 && this.currentTurn !== P1) || (!isP1 && this.currentTurn !== P2)) return [];

        const isKing = piece === P1_KING || piece === P2_KING;

        // P1 moves UP (-1), P2 moves DOWN (+1). Kings move both ways.
        const forwardDir = isP1 ? -1 : 1;
        const directions = isKing ? [
            { dr: -1, dc: -1 }, { dr: -1, dc: 1 },
            { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
        ] : [
            { dr: forwardDir, dc: -1 }, { dr: forwardDir, dc: 1 }
        ];

        let moves = [];
        let jumps = [];

        // All possible moves for this piece
        for (const dir of directions) {
            const nr = pieceR + dir.dr;
            const nc = pieceC + dir.dc;

            if (this.isInBounds(nr, nc)) {
                if (this.board[nr][nc] === EMPTY) {
                    moves.push({ r: nr, c: nc, isJump: false });
                } else if (this.isOpponent(piece, this.board[nr][nc])) {
                    // Check for jump
                    const j_nr = nr + dir.dr;
                    const j_nc = nc + dir.dc;
                    if (this.isInBounds(j_nr, j_nc) && this.board[j_nr][j_nc] === EMPTY) {
                        jumps.push({
                            r: j_nr, c: j_nc,
                            isJump: true,
                            jumpedItem: { r: nr, c: nc }
                        });
                    }
                }
            }
        }

        // In checkers, forced jumps: if a jump is available anywhere for this player, it's mandatory.
        // However, for this check, returning jumps if any from this piece. Global forced jumps check handled higher up.
        return jumps.length > 0 ? jumps : moves;
    }

    // Gets ALL valid moves for current player. Enforces mandatory jump rule.
    getAllValidMovesForPlayer(player) {
        let allMoves = [];
        let allJumps = [];

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece !== EMPTY && ((player === P1 && (piece === P1 || piece === P1_KING)) ||
                    (player === P2 && (piece === P2 || piece === P2_KING)))) {
                    const pieceMoves = this.getValidMoves(r, c);
                    pieceMoves.forEach(m => {
                        const moveObj = { from: { r, c }, to: { r: m.r, c: m.c }, isJump: m.isJump, jumpedItem: m.jumpedItem };
                        if (m.isJump) {
                            allJumps.push(moveObj);
                        } else {
                            allMoves.push(moveObj);
                        }
                    });
                }
            }
        }

        return allJumps.length > 0 ? allJumps : allMoves;
    }

    // Returns true if move was successful, false otherwise.
    // Returns { success: boolean, multipleJumpPossible: boolean }
    move(fromR, fromC, toR, toC) {
        const validMovesForPlayer = this.getAllValidMovesForPlayer(this.currentTurn);

        // Check if the move requested is among the globally valid moves (to enforce mandatory jumps)
        const theMove = validMovesForPlayer.find(m =>
            m.from.r === fromR && m.from.c === fromC && m.to.r === toR && m.to.c === toC
        );

        if (!theMove) return { success: false, multipleJumpPossible: false, captured: false };

        // Apply move
        const piece = this.board[fromR][fromC];
        this.board[fromR][fromC] = EMPTY;
        this.board[toR][toC] = piece;

        let captured = false;
        // Handle capture
        if (theMove.isJump) {
            this.board[theMove.jumpedItem.r][theMove.jumpedItem.c] = EMPTY;
            captured = true;
        }

        // Handle king promotion
        const isP1 = piece === P1 || piece === P1_KING;
        let promoted = false;
        if (isP1 && toR === 0 && piece !== P1_KING) {
            this.board[toR][toC] = P1_KING;
            promoted = true;
        } else if (!isP1 && toR === 7 && piece !== P2_KING) {
            this.board[toR][toC] = P2_KING;
            promoted = true;
        }

        // Multiple jumps
        if (theMove.isJump && !promoted) {
            // Temporarily only check this piece for further jumps
            const furtherMoves = this.getValidMoves(toR, toC);
            const furtherJumps = furtherMoves.filter(m => m.isJump);

            if (furtherJumps.length > 0) {
                // Still this player's turn, MUST jump
                return { success: true, multipleJumpPossible: true, captured: true };
            }
        }

        // End of turn
        this.currentTurn = this.currentTurn === P1 ? P2 : P1;
        return { success: true, multipleJumpPossible: false, captured };
    }

    isOpponent(myPiece, otherPiece) {
        if (otherPiece === EMPTY) return false;
        const iAmP1 = myPiece === P1 || myPiece === P1_KING;
        const theyAreP1 = otherPiece === P1 || otherPiece === P1_KING;
        return iAmP1 !== theyAreP1;
    }

    isInBounds(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }

    isGameOver() {
        // In checkers, a player loses if it is their turn and they have no valid moves.
        const currentMoves = this.getAllValidMovesForPlayer(this.currentTurn);

        if (currentMoves.length === 0) {
            return { over: true, winner: this.currentTurn === P1 ? P2 : P1 };
        }

        // Also check if any pieces left
        let p1Pieces = 0, p2Pieces = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p === P1 || p === P1_KING) p1Pieces++;
                if (p === P2 || p === P2_KING) p2Pieces++;
            }
        }

        if (p1Pieces === 0) return { over: true, winner: P2 };
        if (p2Pieces === 0) return { over: true, winner: P1 };

        return { over: false, winner: null };
    }

    turn() {
        return this.currentTurn;
    }
}

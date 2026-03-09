import React, { memo } from 'react';
import { P1, P2 } from './engine';
import './ReversiBoard.css';

const ReversiBoard = ({ board, onSquareClick, validMoves, boardWidth }) => {

    const renderSquare = (r, c) => {
        const piece = board[r][c];

        // Find if this square is a valid move (to show a hint indicator)
        const isHint = validMoves && validMoves.some(m => m.r === r && m.c === c);

        let squareClass = 'reversi-square';
        if (isHint) squareClass += ' hint';

        let pieceElement = null;
        if (piece !== 0) {
            const isBlack = piece === P1;
            pieceElement = (
                <div className={`reversi-piece ${isBlack ? 'piece-black' : 'piece-white'}`}>
                    <div className="piece-inner"></div>
                </div>
            );
        } else if (isHint) {
            // Little dot to indicate a valid move
            pieceElement = <div className="reversi-hint-dot"></div>;
        }

        return (
            <div
                key={`${r}-${c}`}
                className={squareClass}
                onClick={() => onSquareClick(r, c)}
            >
                {pieceElement}
            </div>
        );
    };

    const grid = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            grid.push(renderSquare(r, c));
        }
    }

    return (
        <div className="reversi-board-wrapper retro-panel wood-dark">
            <div className="reversi-grid" style={{ width: boardWidth, height: boardWidth }}>
                {grid}
            </div>
        </div>
    );
};

export default memo(ReversiBoard);

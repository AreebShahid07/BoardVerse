import React from 'react';
import { P1, P2, P1_KING, P2_KING } from './engine';
import './CheckersBoard.css';

const CheckersBoard = ({ board, onSquareClick, selectedSquare, turn, boardWidth }) => {

    const renderSquare = (r, c) => {
        const isDarkSquare = (r + c) % 2 !== 0;
        const piece = board[r][c];

        let isSelected = selectedSquare && selectedSquare.r === r && selectedSquare.c === c;

        // Class construction
        let squareClass = `checkers-square ${isDarkSquare ? 'dark-square' : 'light-square'}`;
        if (isSelected) squareClass += ' selected';

        let pieceElement = null;
        if (piece !== 0) {
            const isP1 = piece === P1 || piece === P1_KING;
            const isKing = piece === P1_KING || piece === P2_KING;

            let pieceClass = `checkers-piece ${isP1 ? 'piece-p1' : 'piece-p2'}`;
            if (isKing) pieceClass += ' piece-king';

            pieceElement = (
                <div className={pieceClass}>
                    {isKing && <span className="king-crown">♛</span>}
                </div>
            );
        }

        return (
            <div
                key={`${r}-${c}`}
                className={squareClass}
                onClick={() => onSquareClick(r, c)}
            >
                {pieceElement}

                {/* Board Coordinate numbering for flavor, only on edges */}
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
        <div className="checkers-board-wrapper retro-panel wood-dark">
            <div className="checkers-grid" style={{ width: boardWidth, height: boardWidth }}>
                {grid}
            </div>
        </div>
    );
};

export default CheckersBoard;

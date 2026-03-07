import React from 'react';
import './GameBoardLayout.css';

const GameBoardLayout = ({ leftPanel, centerStatusBar, centerBoard, rightPanel, gameOverModal }) => {
    return (
        <div className="game-board-container fade-in">
            <div className="game-board-layout">
                {/* Left Column: History/Notation */}
                <div className="layout-section layout-left">
                    {leftPanel}
                </div>

                {/* Center Column: Board */}
                <div className="layout-section layout-center">
                    {centerStatusBar && (
                        <div className="game-status-bar">
                            {centerStatusBar}
                        </div>
                    )}
                    {centerBoard}
                </div>

                {/* Right Column: Controls */}
                <div className="layout-section layout-right">
                    {rightPanel}
                </div>
            </div>

            {/* Game Over Modal Layer */}
            {gameOverModal && (
                <div className="game-over-modal-overlay">
                    {gameOverModal}
                </div>
            )}
        </div>
    );
};

export default GameBoardLayout;

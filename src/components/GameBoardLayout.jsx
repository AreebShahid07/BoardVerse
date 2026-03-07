import React from 'react';
import { motion } from 'framer-motion';
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
                <motion.div
                    className="layout-section layout-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {centerStatusBar && (
                        <div className="game-status-bar">
                            {centerStatusBar}
                        </div>
                    )}
                    {centerBoard}
                </motion.div>

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

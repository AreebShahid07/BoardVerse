import React from 'react';
import './RetroPanel.css';

const RetroPanel = ({ children, className = '', title, woodStyle = 'dark', padding = 'normal' }) => {
    // woodStyle: 'dark', 'light', 'parchment'
    return (
        <div className={`retro-panel panel-wood-${woodStyle} padding-${padding} ${className}`}>
            {title && (
                <div className="retro-panel-header">
                    <h2 className="retro-panel-title">{title}</h2>
                    <div className="retro-divider" />
                </div>
            )}
            <div className="retro-panel-content">
                {children}
            </div>
        </div>
    );
};

export default RetroPanel;

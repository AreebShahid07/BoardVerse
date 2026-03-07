import React from 'react';
import './Button.css';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }) => {
    return (
        <button
            className={`retro-btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            <span className="btn-inner-border">
                {children}
            </span>
        </button>
    );
};

export default Button;

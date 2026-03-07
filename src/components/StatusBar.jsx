import React from 'react';
import Typewriter from 'typewriter-effect';

/**
 * StatusBar — displays a message with a typing animation effect.
 * Re-animates whenever `message` changes (via key prop reset).
 */
const StatusBar = ({ message, className = '' }) => {
    return (
        <span className={`status-bar-typewriter ${className}`}>
            <Typewriter
                key={message}
                options={{
                    cursor: '',
                    delay: 28, // Fast enough to feel snappy, slow enough to look typed
                    deleteSpeed: Infinity, // Never delete — we use key reset instead
                }}
                onInit={(typewriter) => {
                    typewriter.typeString(message).start();
                }}
            />
        </span>
    );
};

export default StatusBar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="retro-navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon">♛</div>
                    <h1>BoardVerse</h1>
                </Link>
                <div className="navbar-links">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Club</Link>
                    <Link to="/scoreboard" className={`nav-link ${location.pathname === '/scoreboard' ? 'active' : ''}`}>Ledger</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

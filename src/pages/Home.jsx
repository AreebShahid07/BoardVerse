import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import GameCard from '../components/GameCard';
import RetroPanel from '../components/RetroPanel';
import './Home.css';

const Home = () => {
    const headerRef = useRef(null);
    const gridRef = useRef(null);
    const footerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header slides up from below
            gsap.fromTo(headerRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
            );

            // Cards stagger in with scale
            gsap.fromTo(
                gridRef.current.children,
                { opacity: 0, y: 60, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.7,
                    ease: 'power3.out',
                    stagger: 0.15,
                    delay: 0.3,
                }
            );

            // Footer fades in last
            gsap.fromTo(footerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.8, delay: 0.85 }
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="home-container">
            <div className="home-header" ref={headerRef}>
                <h1 className="home-title">Welcome to BoardVerse</h1>
                <p className="home-subtitle">A Classical Strategy Arena</p>
                <div className="retro-divider" style={{ width: '40%', marginTop: '1rem' }} />
            </div>

            <div className="games-grid" ref={gridRef}>
                <GameCard
                    title="Chess"
                    icon="♔"
                    status="available"
                    linkTo="/chess"
                    description="The noble game of kings and queens. Play against a friend or challenge our mechanical automaton across five difficulty levels."
                />

                <GameCard
                    title="Checkers"
                    icon="⛂"
                    status="available"
                    linkTo="/checkers"
                    description="The vintage parlor favorite. Master the diagonal jump to victory in this timeless classic of strategy and nimble tactical movement."
                />

                <GameCard
                    title="Reversi"
                    icon="◓"
                    status="available"
                    linkTo="/reversi"
                    description="The elegant tactical battle. Outflank your opponent to dominate the board in this sophisticated game of skill and dark strategy."
                />
            </div>

            <div className="home-footer-info" ref={footerRef}>
                <RetroPanel woodStyle="dark" padding="small" className="quote-panel">
                    <p className="quote-text">
                        BoardVerse<br />
                        A Classical Strategy Experience
                    </p>
                </RetroPanel>
            </div>
        </div>
    );
};

export default Home;

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import GameCard from '../components/GameCard';
import RetroPanel from '../components/RetroPanel';
import styles from './Home.module.css';

const Home = () => {
    const compRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Logo floats in from above
            gsap.fromTo(`.${styles['home-logo']}`,
                { opacity: 0, y: -30, scale: 0.8 },
                { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)' }
            );

            // Title fades in with elegant reveal
            gsap.fromTo(`.${styles['home-title']}`,
                { opacity: 0, y: 30, letterSpacing: '0.2em' },
                { opacity: 1, y: 0, letterSpacing: '0.08em', duration: 1, ease: 'power3.out', delay: 0.2 }
            );

            // Subtitle slides in
            gsap.fromTo(`.${styles['home-subtitle']}`,
                { opacity: 0, y: 20 },
                { opacity: 0.85, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 }
            );

            // Tagline fades in
            gsap.fromTo(`.${styles['home-tagline']}`,
                { opacity: 0 },
                { opacity: 0.6, duration: 0.8, delay: 0.6 }
            );

            // Divider animates in
            gsap.fromTo(`.${styles['decorative-divider']}`,
                { opacity: 0, scaleX: 0 },
                { opacity: 1, scaleX: 1, duration: 0.8, ease: 'power2.out', delay: 0.5 }
            );

            // Section title fades in
            gsap.fromTo(`.${styles['section-title']}`,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.6 }
            );

            // Cards stagger in with refined animation
            gsap.fromTo(
                '.gsap-card-wrapper',
                { opacity: 0, y: 60, scale: 0.92 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: 0.15,
                    delay: 0.7,
                }
            );

            // Footer fades in last with subtle rise
            gsap.fromTo(`.${styles['home-footer-info']}`,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 1.2 }
            );
        }, compRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className={styles['home-container']} ref={compRef}>
            {/* Hero Section */}
            <header className={styles['home-header']}>
                <img 
                    src="/logo.png" 
                    alt="BoardVerse Logo" 
                    className={styles['home-logo']}
                />
                <h1 className={styles['home-title']}>BoardVerse</h1>
                <p className={styles['home-subtitle']}>A Classical Strategy Arena</p>
                <p className={styles['home-tagline']}>Master the Art of Timeless Games</p>
                
                <div className={styles['decorative-divider']}>
                    <span className={styles['divider-line']} />
                    <span className={styles['divider-ornament']}>&#9830;</span>
                    <span className={styles['divider-line']} />
                </div>
            </header>

            {/* Section Title */}
            <div className={styles['section-title']}>
                <h2 className={styles['section-heading']}>Choose Your Battle</h2>
            </div>

            {/* Games Grid */}
            <div className={styles['games-grid']}>
                <div className="gsap-card-wrapper">
                    <GameCard
                        title="Chess"
                        icon="chess"
                        status="available"
                        linkTo="/chess"
                        description="The noble game of kings and queens. Play against a friend or challenge our mechanical automaton across five difficulty levels."
                    />
                </div>

                <div className="gsap-card-wrapper">
                    <GameCard
                        title="Checkers"
                        icon="checkers"
                        status="available"
                        linkTo="/checkers"
                        description="The vintage parlor favorite. Master the diagonal jump to victory in this timeless classic of strategy and nimble tactical movement."
                    />
                </div>

                <div className="gsap-card-wrapper">
                    <GameCard
                        title="Reversi"
                        icon="reversi"
                        status="available"
                        linkTo="/reversi"
                        description="The elegant tactical battle. Outflank your opponent to dominate the board in this sophisticated game of skill and dark strategy."
                    />
                </div>
            </div>

            {/* Footer Quote */}
            <footer className={styles['home-footer-info']}>
                <RetroPanel woodStyle="dark" padding="small" className={styles['quote-panel']}>
                    <p className={styles['quote-text']}>
                        "In the game of strategy, patience conquers all."
                    </p>
                </RetroPanel>
            </footer>
        </div>
    );
};

export default Home;

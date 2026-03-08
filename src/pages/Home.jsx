import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import GameCard from '../components/GameCard';
import RetroPanel from '../components/RetroPanel';
import styles from './Home.module.css';

const Home = () => {
    const compRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header slides up from below
            gsap.fromTo(`.${styles['home-header']}`,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
            );

            // Cards stagger in with scale
            gsap.fromTo(
                '.gsap-card-wrapper',
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
            gsap.fromTo(`.${styles['home-footer-info']}`,
                { opacity: 0 },
                { opacity: 1, duration: 0.8, delay: 0.85 }
            );
        }, compRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className={styles['home-container']} ref={compRef}>
            <div className={styles['home-header']}>
                <h1 className={styles['home-title']}>Welcome to BoardVerse</h1>
                <p className={styles['home-subtitle']}>A Classical Strategy Arena</p>
                <div className="retro-divider" style={{ width: '40%', marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
            </div>

            <div className={styles['games-grid']}>
                <div className="gsap-card-wrapper">
                    <GameCard
                        title="Chess"
                        icon="♔"
                        status="available"
                        linkTo="/chess"
                        theme="chess"
                        description="The noble game of kings and queens. Play against a friend or challenge our mechanical automaton across five difficulty levels."
                    />
                </div>

                <div className="gsap-card-wrapper">
                    <GameCard
                        title="Checkers"
                        icon="⛂"
                        status="available"
                        linkTo="/checkers"
                        theme="checkers"
                        description="The vintage parlor favorite. Master the diagonal jump to victory in this timeless classic of strategy and nimble tactical movement."
                    />
                </div>

                <div className="gsap-card-wrapper">
                    <GameCard
                        title="Reversi"
                        icon="◓"
                        status="available"
                        linkTo="/reversi"
                        theme="reversi"
                        description="The elegant tactical battle. Outflank your opponent to dominate the board in this sophisticated game of skill and dark strategy."
                    />
                </div>
            </div>

            <div className={styles['home-footer-info']}>
                <RetroPanel woodStyle="dark" padding="small" className={styles['quote-panel']}>
                    <p className={styles['quote-text']}>
                        BoardVerse<br />
                        A Classical Strategy Experience
                    </p>
                </RetroPanel>
            </div>
        </div>
    );
};

export default Home;

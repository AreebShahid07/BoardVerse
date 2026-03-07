import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChessGame from './pages/ChessGame';
import CheckersGame from './games/Checkers/CheckersGame';
import ReversiGame from './games/Reversi/ReversiGame';
import Scoreboard from './pages/Scoreboard';
import Navbar from './components/Navbar';
import useVanta from './hooks/useVanta';

function App() {
    const vantaRef = useRef(null);
    useVanta(vantaRef);

    return (
        <Router>
            <div className="app-container">
                {/* Full-page Vanta background layer */}
                <div
                    ref={vantaRef}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        zIndex: -1,
                    }}
                />
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/chess" element={<ChessGame />} />
                        <Route path="/checkers" element={<CheckersGame />} />
                        <Route path="/reversi" element={<ReversiGame />} />
                        <Route path="/scoreboard" element={<Scoreboard />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;

// LocalStorage wrapper for BoardVerse

const STORAGE_KEY = 'boardverse_stats';

const defaultStats = {
    totalGames: 0,
    chess: { matches: 0, playerWins: 0, botWins: 0 },
    checkers: { matches: 0, playerWins: 0, botWins: 0 },
    reversi: { matches: 0, playerWins: 0, botWins: 0 }
};

export const getStats = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            // Ensure the nested structure exists (legacy state migration support)
            if (parsed.chess && typeof parsed.chess === 'object') {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Failed to read from LocalStorage", e);
    }
    return { ...defaultStats };
};

export const saveStats = (stats) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
        console.error("Failed to write to LocalStorage", e);
    }
};

export const recordGameResult = (winner, gameType = 'chess') => {
    const stats = getStats();

    // Global Match Counter
    stats.totalGames += 1;

    // Safety check in case of new game type
    if (!stats[gameType]) {
        stats[gameType] = { matches: 0, playerWins: 0, botWins: 0 };
    }

    // Isolate
    stats[gameType].matches += 1;

    if (winner === 'player') stats[gameType].playerWins += 1;
    if (winner === 'bot') stats[gameType].botWins += 1;

    // Handles older implementations passing simply 'chess' or 'checkers' as winner string
    if (winner === 'chess' || winner === 'checkers' || winner === 'reversi') {
        stats[gameType].playerWins += 1;
    }

    saveStats(stats);
};

export const resetStats = () => {
    saveStats({ ...defaultStats });
};


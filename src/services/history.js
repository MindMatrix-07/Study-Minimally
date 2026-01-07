const HISTORY_KEY = 'watch_history';

export const addToHistory = (video) => {
    if (!video || !video.id) return;

    const history = getHistory();
    // Remove if already exists (to move to top)
    const filtered = history.filter(v => v.id !== video.id);

    // Add new entry with timestamp
    const entry = {
        ...video,
        watchedAt: new Date().toISOString()
    };

    const newHistory = [entry, ...filtered].slice(0, 100); // Limit to 100 items
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

export const getHistory = () => {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
};

export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};

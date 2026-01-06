import { format } from 'date-fns';

const CHECK_INTERVAL_MS = 60000; // 1 minute
const STORAGE_KEY = 'yt_app_analytics_v1';

// Initial State
const getInitialState = () => ({
    totalMinutes: 0,
    dailyLogs: {}, // "YYYY-MM-DD": minutes
    videoProgress: {}, // "videoId": secondsWatched
});

const loadState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : getInitialState();
    } catch {
        return getInitialState();
    }
};

const saveState = (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const trackHeartbeat = (videoId) => {
    const state = loadState();
    const today = format(new Date(), 'yyyy-MM-dd');

    // Update total
    state.totalMinutes += 1;

    // Update daily
    state.dailyLogs[today] = (state.dailyLogs[today] || 0) + 1;

    saveState(state);
    return state;
};

export const getAnalytics = () => {
    return loadState();
};

export const saveVideoProgress = (videoId, seconds) => {
    const state = loadState();
    state.videoProgress[videoId] = seconds;
    saveState(state);
};

export const getVideoProgress = (videoId) => {
    const state = loadState();
    return state.videoProgress[videoId] || 0;
};

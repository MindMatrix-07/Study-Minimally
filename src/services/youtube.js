import axios from 'axios';
import { subDays, subMonths, subYears, startOfDay } from 'date-fns';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const client = axios.create({
  baseURL: BASE_URL,
});

let _accessToken = null;

export const setAccessToken = (token) => {
  _accessToken = token;
};

// Request interceptor to add the access token header
client.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const CHANNELS = {
  PW_JEE: { id: 'UCVJU_IChPMOe8RWkdVQjtfQ', name: 'Physics Wallah JEE' },
  XYLEM: { id: 'UCaQhwo6un90JE2nDGdtJIIw', name: 'Xylem JEE & KEAM 2026' },
};

// --- HELPERS ---
const UPLOAD_PLAYLIST_CACHE = {};
const getUploadsPlaylistId = async (channelId) => {
  if (UPLOAD_PLAYLIST_CACHE[channelId]) return UPLOAD_PLAYLIST_CACHE[channelId];
  try {
    const response = await client.get('/channels', { params: { id: channelId, part: 'contentDetails' } });
    const pid = response.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (pid) UPLOAD_PLAYLIST_CACHE[channelId] = pid;
    return pid;
  } catch (error) { console.error('Error fetching channel details:', error); return null; }
};

// Calculate Date String for API (RFC 3339)
export const getDateFilter = (filterType) => {
  const now = new Date();
  let after, before;

  if (filterType === 'LAST_WEEK') {
    after = subDays(now, 7);
  } else if (filterType === 'LAST_MONTH') {
    after = subMonths(now, 1);
  } else if (filterType === 'LAST_YEAR') {
    after = subYears(now, 1); // e.g. from 2024 if now 2025
  } else if (filterType === 'LAST_2_YEARS') {
    after = subYears(now, 2);
  } else if (filterType === 'YEAR_2025') {
    after = new Date('2025-01-01'); before = new Date('2026-01-01');
  } else if (filterType === 'YEAR_2024') {
    after = new Date('2024-01-01'); before = new Date('2025-01-01');
  } else if (filterType === 'YEAR_2023') {
    after = new Date('2023-01-01'); before = new Date('2024-01-01');
  } else {
    return null;
  }

  return {
    publishedAfter: after ? startOfDay(after).toISOString() : undefined,
    publishedBefore: before ? startOfDay(before).toISOString() : undefined
  };
};

// --- VIDEOS ---
export const fetchChannelVideos = async (channelId, pageToken = '', dateFilter = null, searchQuery = '') => {
  try {
    const dates = getDateFilter(dateFilter);
    const publishedAfter = dates?.publishedAfter;
    const publishedBefore = dates?.publishedBefore;

    // Use Search API if: filtering by date OR searching text OR getting mixed feed with no optimization
    // We default to Search API for user-context requests to keep it simple, or optimize if 'All Time' + no query

    // Optimization: If NO filter, NO search, use PlaylistItems (Cheaper? Not relevant for User Quota really, but faster)
    if (!publishedAfter && !publishedBefore && !searchQuery) {
      const playlistId = await getUploadsPlaylistId(channelId);
      if (!playlistId) return { items: [], nextPageToken: null };

      const response = await client.get('/playlistItems', {
        params: {
          playlistId,
          part: 'snippet,contentDetails',
          maxResults: 12,
          pageToken
        },
      });
      const items = response.data.items.map(item => ({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        channelId: item.snippet.channelId,
        description: item.snippet.description,
        kind: 'video'
      }));
      return { items, nextPageToken: response.data.nextPageToken };
    }

    // Otherwise use Search API
    const response = await client.get('/search', {
      params: {
        channelId,
        q: searchQuery,
        part: 'snippet',
        type: 'video',
        order: 'date',
        publishedAfter,
        publishedBefore,
        maxResults: 12,
        pageToken
      }
    });

    const items = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      description: item.snippet.description,
      kind: 'video'
    }));
    return { items, nextPageToken: response.data.nextPageToken };

  } catch (error) {
    console.error('Error fetching videos:', error);
    return { items: [], nextPageToken: null };
  }
};

// --- LIVE ARCHIVES ---
export const fetchLiveArchives = async (channelId, pageToken = '', dateFilter = null, searchQuery = '') => {
  try {
    const dates = getDateFilter(dateFilter);
    const response = await client.get('/search', {
      params: {
        channelId,
        q: searchQuery,
        part: 'snippet',
        eventType: 'completed',
        type: 'video',
        order: 'date',
        maxResults: 12,
        pageToken,
        publishedAfter: dates?.publishedAfter,
        publishedBefore: dates?.publishedBefore
      },
    });

    const items = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      description: item.snippet.description,
      isLiveArchive: true,
      kind: 'live'
    }));

    return { items, nextPageToken: response.data.nextPageToken };
  } catch (error) {
    console.error('Error fetching live archives:', error);
    return { items: [], nextPageToken: null };
  }
};

// --- ACTIVE LIVE ---
export const fetchActiveLive = async (channelId) => {
  try {
    const response = await client.get('/search', {
      params: { channelId, part: 'snippet', eventType: 'live', type: 'video', maxResults: 5 },
    });
    return response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      isLive: true,
      channelId: item.snippet.channelId,
      description: item.snippet.description,
      kind: 'live'
    }));
  } catch (error) { return []; }
};

// --- PLAYLISTS ---
export const fetchChannelPlaylists = async (channelId, pageToken = '') => {
  try {
    const response = await client.get('/playlists', {
      params: { channelId, part: 'snippet,contentDetails', maxResults: 12, pageToken }
    });
    const items = response.data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      itemCount: item.contentDetails.itemCount,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      kind: 'playlist'
    }));
    return { items, nextPageToken: response.data.nextPageToken };
  } catch (error) { return { items: [], nextPageToken: null }; }
};

export const fetchPlaylistItems = async (playlistId, pageToken = '') => {
  try {
    const response = await client.get('/playlistItems', {
      params: { playlistId, part: 'snippet,contentDetails', maxResults: 50, pageToken }
    });
    const items = response.data.items.map(item => ({
      id: item.contentDetails.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      description: item.snippet.description,
      kind: 'video'
    }));
    return { items, nextPageToken: response.data.nextPageToken };
  } catch (error) { return { items: [], nextPageToken: null }; }
};

export const fetchPlaylistDetails = async (playlistId) => {
  try {
    const response = await client.get('/playlists', { params: { id: playlistId, part: 'snippet' } });
    return response.data.items[0];
  } catch (error) { return null; }
}

// --- DETAILS & EXTRAS ---
export const fetchVideoDetails = async (videoId) => {
  try {
    const response = await client.get('/videos', {
      params: { id: videoId, part: 'snippet,statistics,liveStreamingDetails' }
    });
    return response.data.items[0];
  } catch (error) { return null; }
};

export const fetchComments = async (videoId) => {
  try {
    const response = await client.get('/commentThreads', {
      params: { videoId, part: 'snippet', maxResults: 30, order: 'relevance' }
    });
    return response.data.items.map(item => ({
      id: item.id,
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      likeCount: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
      authorImage: item.snippet.topLevelComment.snippet.authorProfileImageUrl
    }));
  } catch (error) { return []; }
}

export const fetchLiveChatMessages = async (liveChatId) => {
  try {
    const response = await client.get('/liveChat/messages', {
      params: { liveChatId, part: 'snippet,authorDetails', maxResults: 10 }
    });
    if (!response.data.items) return []; // Safety
    return response.data.items.map(item => ({
      id: item.id,
      author: item.authorDetails.displayName,
      message: item.snippet.displayMessage,
      authorImage: item.authorDetails.profileImageUrl,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) { return []; }
}

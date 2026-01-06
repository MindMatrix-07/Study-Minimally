import axios from 'axios';
import { subDays, subMonths, subYears, startOfDay } from 'date-fns';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

if (!API_KEY) console.error('YouTube API Key is missing! Check .env file.');

const client = axios.create({
  baseURL: BASE_URL,
  params: { key: API_KEY },
});

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
  let date;
  if (filterType === 'WEEK') date = subDays(now, 7);
  else if (filterType === 'MONTH') date = subMonths(now, 1);
  else if (filterType === 'YEAR') date = subYears(now, 1);
  else return null;

  return startOfDay(date).toISOString();
};

// --- VIDEOS ---
// Standard Fetch (Cheap) vs Filtered Fetch (Search API - Expensive)
export const fetchChannelVideos = async (channelId, pageToken = '', dateFilter = null) => {
  try {
    const publishedAfter = getDateFilter(dateFilter);

    // If Filtering by Date, we MUST use Search API (cost: 100 units)
    if (publishedAfter) {
      const response = await client.get('/search', {
        params: {
          channelId,
          part: 'snippet',
          type: 'video',
          order: 'date',
          publishedAfter,
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
    }

    // Otherwise, use Uploads Playlist (Cheaper: 1 unit)
    else {
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
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { items: [], nextPageToken: null };
  }
};

// --- LIVE ARCHIVES ---
export const fetchLiveArchives = async (channelId, pageToken = '', dateFilter = null) => {
  try {
    const publishedAfter = getDateFilter(dateFilter);
    const response = await client.get('/search', {
      params: {
        channelId,
        part: 'snippet',
        eventType: 'completed',
        type: 'video',
        order: 'date',
        maxResults: 12,
        pageToken,
        publishedAfter: publishedAfter || undefined
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

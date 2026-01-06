import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// ... (Client setup remains same)
const client = axios.create({
  baseURL: BASE_URL,
  params: { key: API_KEY },
});

export const CHANNELS = {
  PW_JEE: { id: 'UCVJU_IChPMOe8RWkdVQjtfQ', name: 'Physics Wallah JEE' },
  XYLEM: { id: 'UCaQhwo6un90JE2nDGdtJIIw', name: 'Xylem JEE & KEAM 2026' },
};

// --- VIDEO & LIVE FETCHING ---
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

export const fetchChannelVideos = async (channelId, pageToken = '', maxResults = 12) => {
  const playlistId = await getUploadsPlaylistId(channelId);
  if (!playlistId) return { items: [], nextPageToken: null };
  try {
    const response = await client.get('/playlistItems', {
      params: { playlistId, part: 'snippet,contentDetails', maxResults, pageToken },
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
  } catch (error) { console.error('Error fetching videos:', error); return { items: [], nextPageToken: null }; }
};

export const fetchLiveArchives = async (channelId, pageToken = '') => {
  try {
    const response = await client.get('/search', {
      params: {
        channelId, part: 'snippet', eventType: 'completed', type: 'video', order: 'date', maxResults: 12, pageToken
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
  } catch (error) { console.error('Error fetching live archives:', error); return { items: [], nextPageToken: null }; }
};

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
  } catch (error) { console.error('Error fetching active live streams:', error); return []; }
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
  } catch (error) { console.error('Error fetching playlists:', error); return { items: [], nextPageToken: null }; }
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
  } catch (error) { console.error('Error fetching playlist items:', error); return { items: [], nextPageToken: null }; }
};

export const fetchPlaylistDetails = async (playlistId) => {
  try {
    const response = await client.get('/playlists', { params: { id: playlistId, part: 'snippet' } });
    return response.data.items[0];
  } catch (error) { return null; }
}

// --- DETAILS, COMMENTS & LIVE CHAT ---

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

// Fetch Live Chat
export const fetchLiveChatMessages = async (liveChatId) => {
  try {
    const response = await client.get('/liveChat/messages', {
      params: {
        liveChatId,
        part: 'snippet,authorDetails',
        maxResults: 10 // don't overwhelm
      }
    });
    return response.data.items.map(item => ({
      id: item.id,
      author: item.authorDetails.displayName,
      message: item.snippet.displayMessage,
      authorImage: item.authorDetails.profileImageUrl,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error("Error fetching live chat", error);
    return [];
  }
}

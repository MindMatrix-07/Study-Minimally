import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

if (!API_KEY) {
  console.error('YouTube API Key is missing! Check .env file.');
}

const client = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

export const CHANNELS = {
  PW_JEE: {
    id: 'UCVJU_IChPMOe8RWkdVQjtfQ',
    name: 'Physics Wallah JEE'
  },
  XYLEM: {
    id: 'UCaQhwo6un90JE2nDGdtJIIw',
    name: 'Xylem JEE & KEAM 2026'
  },
};

// Cache to store upload playlist IDs
const UPLOAD_PLAYLIST_CACHE = {};

const getUploadsPlaylistId = async (channelId) => {
  if (UPLOAD_PLAYLIST_CACHE[channelId]) return UPLOAD_PLAYLIST_CACHE[channelId];

  try {
    const response = await client.get('/channels', {
      params: {
        id: channelId,
        part: 'contentDetails',
      },
    });
    const playlistId = response.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (playlistId) {
      UPLOAD_PLAYLIST_CACHE[channelId] = playlistId;
    }
    return playlistId;
  } catch (error) {
    console.error('Error fetching channel details:', error);
    return null;
  }
};

// Fetch standard uploads (The "Videos" Tab)
export const fetchChannelVideos = async (channelId, pageToken = '', maxResults = 12) => {
  const playlistId = await getUploadsPlaylistId(channelId);
  if (!playlistId) return { items: [], nextPageToken: null };

  try {
    const response = await client.get('/playlistItems', {
      params: {
        playlistId: playlistId,
        part: 'snippet,contentDetails',
        maxResults: maxResults,
        pageToken: pageToken
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

    return {
      items,
      nextPageToken: response.data.nextPageToken
    };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { items: [], nextPageToken: null };
  }
};

// Fetch Past Live Streams (The "Live" Tab - Archives)
export const fetchLiveArchives = async (channelId, pageToken = '') => {
  try {
    const response = await client.get('/search', {
      params: {
        channelId: channelId,
        part: 'snippet',
        eventType: 'completed', // Past live streams
        type: 'video',
        order: 'date',
        maxResults: 12,
        pageToken: pageToken
      },
    });

    const items = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      description: item.snippet.description,
      isLiveArchive: true,
      kind: 'live'
    }));

    return {
      items,
      nextPageToken: response.data.nextPageToken
    };
  } catch (error) {
    console.error('Error fetching live archives:', error);
    return { items: [], nextPageToken: null };
  }
};

// Fetch Currently Active Live Streams
export const fetchActiveLive = async (channelId) => {
  try {
    const response = await client.get('/search', {
      params: {
        channelId: channelId,
        part: 'snippet',
        eventType: 'live',
        type: 'video',
        maxResults: 5,
      },
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
  } catch (error) {
    console.error('Error fetching active live streams:', error);
    return [];
  }
};

export const fetchVideoDetails = async (videoId) => {
  try {
    const response = await client.get('/videos', {
      params: {
        id: videoId,
        part: 'snippet,statistics',
      }
    });
    return response.data.items[0];
  } catch (error) {
    console.error("Error fetching video details", error);
    return null;
  }
};

export const fetchComments = async (videoId) => {
  try {
    const response = await client.get('/commentThreads', {
      params: {
        videoId: videoId,
        part: 'snippet',
        maxResults: 20,
        order: 'relevance'
      }
    });
    return response.data.items.map(item => ({
      id: item.id,
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      likeCount: item.snippet.topLevelComment.snippet.likeCount
    }));
  } catch (error) {
    console.error("Error fetching comments", error);
    return [];
  }
}

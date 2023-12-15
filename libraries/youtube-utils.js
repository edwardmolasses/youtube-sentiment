require("dotenv").config();
const { channelId, videoId } = require('@gonetone/get-youtube-id-by-url')
const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');

async function fetchChannelId(channelName) {
    const id = await channelId(channelName);
    return id;
}

async function fetchVideoTranscript(videoId) {
    const log = await YoutubeTranscript.fetchTranscript(videoId);
    return log.map(item => item.text).join(' ');
}

async function fetchChannelVideos(channelId) {
    const videoListApiUrl = `https://www.googleapis.com/youtube/v3/search?key=${process.env.GOOGLE_API}&channelId=${channelId}&part=snippet,id&order=date&maxResults=5`;
    try {
        const response = await axios.get(videoListApiUrl);
        // Handle the response data, which contains information about the latest videos
        return response.data.items;
    } catch (error) {
        // Handle errors
        console.error('Error fetching data from YouTube API:', error.message);
    }
}

module.exports = { fetchChannelId, fetchChannelVideos, fetchVideoTranscript };
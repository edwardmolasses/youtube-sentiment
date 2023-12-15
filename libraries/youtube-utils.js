require("dotenv").config();
const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');

async function fetchChannelId(channelName) {
    const channelIdApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${channelName}&key=${process.env.GOOGLE_API}`;

    try {
        const response = await axios.get(channelIdApiUrl);
        return response.data.items[0].id;
    } catch (error) {
        // Handle errors
        console.error('Error fetching data from YouTube API:', error.message);
    }
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
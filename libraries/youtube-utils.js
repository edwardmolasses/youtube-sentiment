require("dotenv").config();
const { channelId, videoId } = require('@gonetone/get-youtube-id-by-url')
const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');
const { channelVideos } = require('yt-getvideos');

async function fetchChannelId(channelName) {
    const id = await channelId(channelName);
    console.log('channel id:', id);
    return id;
}

async function fetchVideoTranscript(videoId) {
    const log = await YoutubeTranscript.fetchTranscript(videoId);
    return log.map(item => item.text).join(' ');
}

// async function fetchChannelVideos(channelId) {
async function fetchChannelVideos(channelUrl) {
    videosList = await channelVideos(channelUrl);
    return videosList;
}

module.exports = { fetchChannelId, fetchChannelVideos, fetchVideoTranscript };
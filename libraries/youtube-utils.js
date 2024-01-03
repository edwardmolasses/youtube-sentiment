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

async function fetchChannelVideos(channelUrl) {
    videosList = await channelVideos(channelUrl);
    return videosList;
}

function getChannelNameListVideosUrls(channelNameList) {
    return channelNameList.map(name => `https://www.youtube.com/@${name}/videos`);
}

async function getAllChannelVideos(channelNameList) {
    const channelUrlList = getChannelNameListVideosUrls(channelNameList);
    const allChannelVideos = (await Promise.all(channelUrlList.map(async channelUrl => {
        let videos = await fetchChannelVideos(channelUrl);
        videos = videos.map(video => ({ ...video, channelUrl }));
        return videos;
    })))[0];

    return allChannelVideos;
}

async function getAllVideoTranscripts(allChannelVideoIds) {
    const transcripts = await Promise.all(allChannelVideoIds.map(async video => {
        console.log('checking video: ', video.id);
        const transcript = await fetchVideoTranscript(video.id);
        return {
            ...video,
            transcript
        };
    }));

    return transcripts;
}

module.exports = { getAllChannelVideos, getAllVideoTranscripts };
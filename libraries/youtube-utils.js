require("dotenv").config();
const { channelId, videoId } = require('@gonetone/get-youtube-id-by-url');
const { YoutubeTranscript } = require('youtube-transcript');
const { channelVideos } = require('yt-getvideos');
const { getPlaylist } = require('@fabricio-191/youtube')

function splitStringIntoChunks(str, chunkSize = 15000) {
    const numChunks = Math.ceil(str.length / chunkSize);
    return Array.from({ length: numChunks }, (_, i) => {
        const startIndex = i * chunkSize;
        const endIndex = startIndex + chunkSize;
        const chunk = str.slice(startIndex, endIndex);
        const isLastChunk = i === numChunks - 1;
        const prefix = isLastChunk ? `[START PART ${i + 1}/${numChunks}]` : `Do not answer yet. This is just another part of the text I want to send you. Just receive and acknowledge as "Part ${i + 1}/${numChunks} received" and wait for the next part.\n[START PART ${i + 1}/${numChunks}]`;
        const suffix = isLastChunk ? `[END PART ${i + 1}/${numChunks}]\nALL PARTS SENT. Now you can continue processing the request.` : `[END PART ${i + 1}/${numChunks}]\nRemember not answering yet. Just acknowledge you received this part with the message "Part ${i + 1}/${numChunks} received" and wait for the next part.`;
        return `${prefix}\n${chunk}\n${suffix}`;
    });
}

function getPlaylistIdFromUrl(urlStr) {
    const url = new URL(urlStr);
    const params = new URLSearchParams(url.search);
    return params.get('list');
}

// output can be used in getAllVideoTranscripts
async function getPlaylistVideos(playlistUrl, maxVideos = 10) {
    const playlistId = getPlaylistIdFromUrl(playlistUrl);
    console.log('playlist id:', playlistId);

    const playlistVideos = await getPlaylist(playlistId);

    return playlistVideos.videos.slice(0, maxVideos).map(item => {
        return {
            ...item,
            id: item.ID,
        };
    });
}

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

async function getVideoTranscript(videoId) {
    const transcript = await fetchVideoTranscript(videoId);
    return transcript;
}

async function getAllVideoTranscripts(allChannelVideoIds) {
    const transcripts = await Promise.all(allChannelVideoIds.map(async video => {
        console.log('checking video: ', video.id);
        const transcript = await getVideoTranscript(video.id);
        return {
            ...video,
            transcript
        };
    }));

    return transcripts;
}

module.exports = { getAllChannelVideos, getAllVideoTranscripts, getPlaylistVideos, fetchChannelId, getVideoTranscript, splitStringIntoChunks };
require("dotenv").config();
const { channelId, videoId } = require('@gonetone/get-youtube-id-by-url')
const { YoutubeTranscript } = require('youtube-transcript');
const { channelVideos } = require('yt-getvideos');
const { Client } = require("youtubei");
const youtube = new Client();

const channelNameList = [
    'CryptoGainsChannel',
    'AltcoinBuzz',
]

async function fetchChannelId(channelName) {
    const id = await channelId(channelName);
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

async function getAllChannelVideos() {
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

async function getAllVideoMetadatas(allChannelVideoIds) {
    const videoMetadatasList = await Promise.all(allChannelVideoIds.map(async video => {
        console.log('checking video: ', video.id);
        const videoMetadata = await youtube.getVideo(video.id);
        const channelUrl = video.channelUrl;
        const transcript = await fetchVideoTranscript(video.id);

        return {
            ...videoMetadata,
            channelUrl,
            transcript
        };
    }));
    const videoMetadataListClean = videoMetadatasList.map(video => {
        return {
            id: video.id,
            title: video.title,
            description: video.description,
            channelUrl: video.channelUrl,
            uploadDate: video.uploadDate,
            duration: video.duration,
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            tags: video.tags,
            transcript: video.transcript,
        };
    });

    return videoMetadataListClean;
}

module.exports = { getAllChannelVideos, getAllVideoMetadatas };
const fs = require('fs');
const { fetchChannelId, fetchChannelVideos, fetchVideoTranscript } = require('./libraries/youtube-utils');
const { all } = require('axios');
const channelNameList = [
    'cryptogainschannel',
    'AltcoinBuzz',
]

function getChannelNameListVideosUrls(channelNameList) {
    return channelNameList.map(name => `https://www.youtube.com/@${name}/videos`);
}

async function getTranscripts(cronInterval) {
    const channelUrlList = getChannelNameListVideosUrls(channelNameList);
    console.log(`running the script at ${cronInterval} minute intervals ...`);
    const allChannelVideos = (await Promise.all(channelUrlList.map(async channelUrl => {
        let videos = await fetchChannelVideos(channelUrl);
        videos = videos.map(video => ({ ...video, channelUrl }));
        return videos;
    })))[0];
    const transcripts = await Promise.all(allChannelVideos.map(async video => {
        console.log('checking video: ', video.id);
        const transcript = await fetchVideoTranscript(video.id);
        return {
            ...video,
            transcript
        };
    }));
    fs.writeFileSync('channelVideos.json', JSON.stringify(transcripts, null, 2));
    transcripts && console.log('retrieved video transcripts (see channelVideos.json)');
}

module.exports = { getTranscripts };
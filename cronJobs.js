const fs = require('fs');
const { getAllChannelVideos, getAllVideoMetadatas } = require('./libraries/youtube-utils');

async function getTranscripts(cronInterval) {
    console.log(`running the script at ${cronInterval} minute intervals ...`);

    const allChannelVideoIds = await getAllChannelVideos();
    const videoMetadataList = await getAllVideoMetadatas(allChannelVideoIds);

    videoMetadataList && console.log('retrieved video transcripts (see channelVideos.json)');
    fs.writeFileSync('channelVideos.json', JSON.stringify(videoMetadataList, null, 2));
}

module.exports = { getTranscripts };
const fs = require('fs');
const { getAllChannelVideos, getAllVideoTranscripts } = require('./libraries/youtube-utils');

async function getTranscripts(cronInterval) {
    console.log(`running the script at ${cronInterval} minute intervals ...`);
    const allChannelVideoIds = await getAllChannelVideos();
    const transcripts = await getAllVideoTranscripts(allChannelVideoIds);
    fs.writeFileSync('channelVideos.json', JSON.stringify(transcripts, null, 2));
    transcripts && console.log('retrieved video transcripts (see channelVideos.json)');
}

module.exports = { getTranscripts };
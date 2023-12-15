const fs = require('fs');
const { fetchChannelId, fetchChannelVideos, fetchVideoTranscript } = require('./libraries/youtube-utils');
const channelNameList = [
    'https://www.youtube.com/@cryptogainschannel',
    'https://www.youtube.com/@AltcoinBuzz',
]

async function getTranscripts(cronInterval) {
    console.log(`Running the script at ${cronInterval} minute intervals.`);
    const channelIds = await Promise.all(channelNameList.map(name => fetchChannelId(name)));
    const allChannelVideos = (await Promise.all(channelIds.map(id => fetchChannelVideos(id)))).flat();

    const transcripts = await Promise.all(allChannelVideos.map(video => fetchVideoTranscript(video.id.videoId)));
    fs.writeFileSync('channelVideos.json', JSON.stringify(transcripts, null, 2));
    transcripts && console.log('retrieved video transcripts (see channelVideos.json)');
}

module.exports = { getTranscripts };
const { fetchChannelId, fetchChannelVideos, fetchVideoTranscript } = require('./libraries/youtube-utils');

async function getTranscripts(cronInterval) {
    console.log(`Running the script at ${cronInterval} minute intervals.`);
    const channelId = await fetchChannelId('CBCNews');
    const channelVideos = await fetchChannelVideos(channelId);
    const testVideoId = channelVideos[0].id.videoId;
    console.log(`first item videoId: ${testVideoId}`);

    const log = await fetchVideoTranscript(testVideoId);
    console.log(log);
}

module.exports = { getTranscripts };
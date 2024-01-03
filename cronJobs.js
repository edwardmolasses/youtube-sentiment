const fs = require('fs');
const path = require('path');
const { getAllChannelVideos, getAllVideoTranscripts } = require('./libraries/youtube-utils');
const channelNameList = [
    'cryptogainschannel',
    'AltcoinBuzz',
];
let currentChannelIndex = 0;

async function getTranscripts(cronInterval) {
    console.log(`running the script at ${cronInterval} minute intervals ...`);

    // Retrieve the current channel name
    const currentChannelName = channelNameList[currentChannelIndex];

    // Increment the index for the next run (cyclically)
    currentChannelIndex = (currentChannelIndex + 1) % channelNameList.length;

    // Fetch videos and transcripts for the current channel
    const channelVideos = await getAllChannelVideos([currentChannelName]);
    const transcripts = await getAllVideoTranscripts(channelVideos);

    // Create a folder if it doesn't exist
    const folderPath = path.join(__dirname, 'videoMetadata');
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    // Write transcripts to a file in the folder
    const filePath = path.join(folderPath, `${currentChannelName}_videos.json`);
    fs.writeFileSync(filePath, JSON.stringify(transcripts, null, 2));

    transcripts && console.log(`Retrieved video transcripts for ${currentChannelName} (see ${filePath})`);
}

module.exports = { getTranscripts };
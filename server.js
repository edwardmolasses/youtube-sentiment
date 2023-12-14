require("dotenv").config();

const { fetchChannelId, fetchChannelVideos } = require('./libraries/youtube-utils');
const express = require('express');
const path = require('path');
const cron = require('node-cron');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const port = 3001;
const cronInterval = 1;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// Serve React App (build version)
const staticPath = path.join(__dirname, 'client/docs');
app.use(express.static(staticPath));

app.get('*', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    console.log(`Attempting to serve index.html from: ${indexPath}`);
    res.sendFile(indexPath);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

cron.schedule(`*/${cronInterval} * * * *`, async () => {
    console.log(`Running the script at ${cronInterval} minute intervals.`);
    const channelId = await fetchChannelId('CBCNews');
    const channelVideos = await fetchChannelVideos(channelId);

    channelVideos.forEach(item => {
        console.log(JSON.stringify(item, null, 2));
    });

    // Your script logic goes here
});

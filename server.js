require("dotenv").config();

const express = require('express');
const path = require('path');
const cron = require('node-cron');
const cors = require('cors');
const { google } = require('googleapis');
const axios = require('axios');
const app = express();
const port = 3001;

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

async function fetchChannelId(channelName) {
    const channelIdApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${channelName}&key=${process.env.GOOGLE_API}`;

    try {
        const response = await axios.get(channelIdApiUrl);
        return response.data.items[0].id;
    } catch (error) {
        // Handle errors
        console.error('Error fetching data from YouTube API:', error.message);
    }
}

async function fetchChannelVideos(channelId) {
    const videoListApiUrl = `https://www.googleapis.com/youtube/v3/search?key=${process.env.GOOGLE_API}&channelId=${channelId}&part=snippet,id&order=date&maxResults=5`;
    try {
        const response = await axios.get(videoListApiUrl);
        // Handle the response data, which contains information about the latest videos
        return response.data.items;
    } catch (error) {
        // Handle errors
        console.error('Error fetching data from YouTube API:', error.message);
    }
}

cron.schedule('*/1 * * * *', async () => {
    console.log('Running the script every minute.');
    const channelId = await fetchChannelId('CBCNews');
    const channelVideos = await fetchChannelVideos(channelId);

    channelVideos.forEach(item => {
        console.log(JSON.stringify(item, null, 2));
    });

    // Your script logic goes here
});

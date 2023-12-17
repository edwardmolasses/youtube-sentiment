require("dotenv").config();
const { getTranscripts } = require('./cronJobs');
const express = require('express');
const path = require('path');
const cron = require('node-cron');
const cors = require('cors');
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
    getTranscripts(cronInterval);
});

const cron = require('node-cron');

cron.schedule('*/5 * * * *', () => {
    console.log('Running the script every 5 minutes.');
    // Your script logic goes here
});

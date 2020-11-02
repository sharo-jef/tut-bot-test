// @ts-check
import axios from 'axios';
import Line from './line.js';
import log4js from 'log4js';

const logger = log4js.getLogger();
logger.level = process.env.LOG_LEVEL;

const client = new Line(process.env.PORT, {
    channelAccessToken: process.env.TOKEN,
    channelSecret: process.env.SECRET,
});

client.on('message', async message => {
    const response = await axios.post(process.env.BACKEND_SERVER_URI_BASE, message)
        .catch(error => logger.error(error));
    if (!response) {
        return;
    }
    client.send(response.data.messages);
});

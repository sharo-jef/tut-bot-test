// @ts-check
import Line from './line.js';

new Line({
    channelAccessToken: process.env.TOKEN,
    channelSecret: process.env.SECRET,
});

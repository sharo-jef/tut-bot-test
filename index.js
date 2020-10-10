import line from '@line/bot-sdk'
import express from 'express'

const config = {
    channelAccessToken: 'oThSS0dRpWWNegfDp5RO6MPtiNYfeWwmcOJt93e/pwrD1Tx6qGBJapiHCmZjH+GWJ5oCyLWvvaLxeq+RpGlz1wNOU98pNaZ+lrNOec9zSkhbOFw+rSfLQ5RtVShadp/UFCIB7EFTsGf+kUFGLxM2NQdB04t89/1O/w1cDnyilFU=',
    channelSecret: '589de7a74a4bcbab30afe84b55ab193d',
};
const client = new line.Client(config);

const app = express();
const listener = app.listen(process.env.PORT || 80, () => console.log(`listen on ${listener.address().port}`));

app.get('/', (_, res) => res.send('OK'));
app.post('/hook', line.middleware(config), main);

/**
 * main function
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
function main(req, res) {
    res.status(200).end();
    console.log(req.body);
}

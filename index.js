import axios from 'axios'
import bodyParser from 'body-parser'
import express from 'express'
import line from '@line/bot-sdk'

const BACKEND_SERVER_URI_BASE = 'https://bot-php-api.herokuapp.com/api.php';
const config = {
    channelAccessToken: 'oThSS0dRpWWNegfDp5RO6MPtiNYfeWwmcOJt93e/pwrD1Tx6qGBJapiHCmZjH+GWJ5oCyLWvvaLxeq+RpGlz1wNOU98pNaZ+lrNOec9zSkhbOFw+rSfLQ5RtVShadp/UFCIB7EFTsGf+kUFGLxM2NQdB04t89/1O/w1cDnyilFU=',
    channelSecret: '589de7a74a4bcbab30afe84b55ab193d',
};
const client = new line.Client(config);

const app = express();
const listener = app.listen(process.env.PORT || 80, async () => {
    console.log(`listen on ${listener.address().port}`);

    const richMenu = await client.createRichMenu({
        size: {
            width: 2500,
            height: 843,
        },
        selected: true,
        name: 'Menu',
        chatBarText: 'メニュー',
        areas: [
            {
                bounds: {
                    x: 0,
                    y: 0,
                    width: 2500,
                    height: 843,
                },
                action: {
                    type: 'message',
                    label: 'test',
                    text: 'テスト',
                },
            },
        ],
    });

    console.log(richMenu);

    client.setDefaultRichMenu(richMenu);
});

app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.text());

app.get('/', (_, res) => res.send('OK'));
app.post('/hook', line.middleware(config), main);
app.post('/push', async (req ,res) => {
    res.send(req.body);
    const response = JSON.parse(req.body);
    const result = await client.pushMessage(response.to, response.messages);
    console.log(result);
});

// DEBUG
app.get('/debug', (req, res) => {
    res.send(req.body);
});

/**
 * main function
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
async function main(req, res) {
    res.status(200).end();
    console.log(req.body);
    const response = await axios.post(BACKEND_SERVER_URI_BASE, req.body);
    console.log(response.data);
    const test = await axios.get('https://www.google.com/');
    console.log(test.data);
}

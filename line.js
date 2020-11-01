// @ts-check
import fs from 'fs';

import axios from 'axios';
import line from '@line/bot-sdk';
import log4js from 'log4js';

import express from 'express';
import IClient from './iclient.js';
import richmenu from './richmenu.js';

/**
 * @class Line line client wrapper
 * @implements {IClient}
 */
 export default class Line extends IClient {
    /**
     * @type {line.Client}
     */
    client = null;
    /**
     * constructor of line client
     * @param {line.MiddlewareConfig&line.ClientConfig} config config
     */
    constructor(config) {
        super();
        this.client = new line.Client(config);
        this.logger = log4js.getLogger('Line');
        this.logger.level = process.env.LOG_LEVEL;
        this.app = express();
        const listener = this.app.listen(process.env.PORT, () => this.logger.info(`listening on port ${listener.address().port}`));
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(express.text());
        this.app.get('/', (_, res) => res.send('OK'));
        this.app.post('/hook', line.middleware(config), async (req, res) => {
            res.status(200).end();
            this.logger.debug(JSON.stringify(req.body, null, 4));
            const response = await axios.post(process.env.BACKEND_SERVER_URI_BASE, req.body).catch(error => this.logger.error(error));
            if (!response) {
                throw new Error(`response is ${typeof response}`);
            }
            this.logger.debug(response.data);
            this.send(response.data.to, response.data.messages);
        });
        this.app.post('/push', async (req, res) => {
            res.send(req.body);
            this.logger.debug('req:', req.body);
            /**
             * @type {import('./iclient.js').MessageObject}
             */
            const request = JSON.parse(req.body);
            this.send(request.to, request.messages);
        });
        this.app.get('/settings', (_, res) => {
            res.sendFile(`${process.env.ROOT}/settings/index.html`);
        });

        // ! DEBUG
        this.app.get('/debug', (req, res) => {
            res.send(req.body);
        });
        this.client.createRichMenu(richmenu)
            .then(async menuId => {
                this.logger.debug('generated richmenu:', menuId);
                await this.client.setRichMenuImage(menuId, fs.createReadStream(`${process.env.ROOT}/img/menu1.png`))
                    .catch(error => this.logger.error(error));
                await this.client.setDefaultRichMenu(menuId)
                    .catch(error => this.logger.error(error));
            })
            .catch(error => this.logger.error(error));
    }

    /**
     * @override
     * @param {string|string[]} to array of user id
     * @param {import('./iclient.js').Message[]} messages messages
     */
    send(to, messages) {
        const lineMessages = [];
        messages.map(this._convertMessage).forEach(message => {
            if (message.type === 'text') {
                lineMessages.push(message);
            } else if (message.type === 'template' && message.template.type === 'carousel') {
                const MAX_COLUMNS = 5;
                for (let i = 0; i < message.template.columns.length; i += MAX_COLUMNS) {
                    /** @type {import('@line/bot-sdk').TemplateMessage} */
                    const tempMessage = Object.assign({}, message);
                    if (tempMessage.template.type !== 'carousel') {
                        lineMessages.push(message);
                        break;
                    }
                    tempMessage.template.columns = message.template.columns.slice(i, i + MAX_COLUMNS);
                    lineMessages.push(tempMessage);
                }
            }
        });


        const MAX_MESSAGES = 5;
        for (let i = 0; i < lineMessages.length; i += MAX_MESSAGES) {
            const tempMessages = lineMessages.slice(i, i + MAX_MESSAGES);
            if (typeof to === 'string') {
                this.client.pushMessage(to, tempMessages).catch(error => this.logger.error(error));
            } else if (Array.isArray(to)) {
                this.client.multicast(to, tempMessages).catch(error => this.logger.error(error));
            } else {
                throw new TypeError('to is not a string or string[]');
            }
        }
    }

    /**
     * convert general message object into line message object
     * @param {import('./iclient.js').Message} message general message object
     * @return {line.Message}
     */
    _convertMessage(message) {
        switch (message.type) {
        case 'text':
            return {
                type: 'text',
                text: message.text,
            };
        case 'multiple':
            return {
                type: 'template',
                altText: message.altText,
                template: {
                    type: 'carousel',
                    columns: message.contents.map(content => /** @type {line.TemplateColumn} */ ({
                        title: content.title,
                        text: content.content,
                        defaultAction: {
                            type: 'uri',
                            label: content.label,
                            uri: content.uri,
                        },
                        actions: [
                            {
                                type: 'uri',
                                label: content.label,
                                uri: content.uri,
                                altUri: {
                                    desktop: content.uri,
                                },
                            },
                        ],
                    })),
                },
            };
        }
    }
}

// @ts-check
import fs from 'fs';

import express from 'express';
import line from '@line/bot-sdk';
import log4js from 'log4js';

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
     * @param {string} port port
     * @param {line.MiddlewareConfig&line.ClientConfig} config config
     */
    constructor(port, config) {
        super();
        /** @type {{type:string,listener:function}[]} */
        this.listeners = [];
        this.client = new line.Client(config);
        this.logger = log4js.getLogger('Line');
        this.logger.level = process.env.LOG_LEVEL;
        this.app = express();
        const listener = this.app.listen(port, () => this.logger.info(`listening on port ${listener.address().port}`));
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(express.text());
        this.app.get('/', (_, res) => res.send('OK'));
        this.app.post('/hook', line.middleware(config), async (req, res) => {
            res.status(200).end();
            const message = req.body.events.map(this._convertToGeneral);
            const listeners = this.listeners.filter(listener => listener.type === 'message');
            for (const listener of listeners) {
                await listener.listener(message);
            }
        });
        this.app.post('/push', async (req, res) => {
            res.send(req.body);
            /**
             * @type {{messages:import('./iclient.js').Message[]}}
             */
            const request = JSON.parse(req.body);
            this.send(request.messages);
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
     * method to add event listener
     * @param {'message'} event event type
     * @param {function} listener listener function
     */
    on(event, listener) {
        this.listeners.push({type: event, listener});
    }

    /**
     * @override
     * @param {import('./iclient.js').Message[]} messages messages
     */
    async send(messages) {
        /** @type {{to:string[],message:import('@line/bot-sdk').Message}[]} */
        const lineMessages = [];
        messages.map(this._convertToLine).forEach(message => {
            if (message.message.type === 'text') {
                lineMessages.push(message);
            } else if (message.message.type === 'template' && message.message.template.type === 'carousel') {
                const MAX_COLUMNS = 10;
                for (let i = 0; i < message.message.template.columns.length; i += MAX_COLUMNS) {
                    const tempMessage = JSON.parse(JSON.stringify(message));
                    tempMessage.message.template.columns = tempMessage.message.template.columns.slice(i, i + MAX_COLUMNS);
                    lineMessages.push(tempMessage);
                }
            }
        });

        for (const message of lineMessages) {
            const MAX_RECIPIENTS = 500;
            for (let i = 0; i < message.to.length; i += MAX_RECIPIENTS) {
                await this.client.multicast(message.to.slice(i, i + MAX_RECIPIENTS), message.message)
                    .catch(error => this.logger.fatal(error));
            }
        }
    }

    /**
     * convert general message object into line message object
     * @param {import('./iclient.js').Message} message general message object
     * @return {{to:string[],message:line.Message}}
     */
    _convertToLine(message) {
        switch (message.type) {
        case 'text':
            return {
                to: message.to,
                message: {
                    type: 'text',
                    text: message.text,
                },
            };
        case 'multiple':
            return {
                to: message.to,
                message: {
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
                },
            };
        }
    }

     /**
     * convert line message object into general message object
     * @param {line.MessageEvent} message general message object
     * @return {import('./iclient.js').Message}
     */
    _convertToGeneral(message) {
        if (message.type !== 'message') {
            return null;
        }
        if (message.message.type !== 'text') {
            return null;
        }
        return {
            to: [message.source.userId],
            type: 'text',
            text: message.message.text
        };
    }
}

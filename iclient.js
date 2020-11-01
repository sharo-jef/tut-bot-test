// @ts-check
/**
 * @typedef {Object} ClientOption client option
 * @property {?string} token client token
 *
 * @typedef {Object} Content content
 * @property {?string} title title
 * @property {!string} content text content
 * @property {?string} uri uri
 * @property {?string} label label
 *
 * @typedef {Object} TextMessage text message
 * @property {'text'} type type
 * @property {!string} text text
 *
 * @typedef {Object} MultipleMessage multiple message
 * @property {'multiple'} type type
 * @property {?string} altText alternative text
 * @property {!Content[]} contents contents
 *
 * @typedef {TextMessage|MultipleMessage} Message message
 *
 * @typedef {{to:string|string[],messages:Message[]}} MessageObject message with id of the target recipient
 *
 * @typedef {string} EventType event type
 */

/**
 * @interface IClient interface of client
 */
export default class IClient {
    /**
     * send method
     * @virtual
     * @param {string|string[]} to userids
     * @param {Message[]} messages messages
     */
    send(to, messages) {

    }

    /**
     * @virtual
     * @param {EventType} event event type
     * @param {function} listener listener function
     */
    on(event, listener) {

    }
}

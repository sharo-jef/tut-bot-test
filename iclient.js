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
 * @property {!string[]} to id of the target recipient
 * @property {'text'} type type
 * @property {!string} text text
 * @property {?QuickReply} quickReply quick reply
 *
 * @typedef {Object} MultipleMessage multiple message
 * @property {!string[]} to id of the target recipient
 * @property {'multiple'} type type
 * @property {!string} altText alternative text
 * @property {!Content[]} contents contents
 *
 * @typedef {Object} FollowMessage follow message
 * @property {!string[]} to id of the target recipient
 * @property {'follow'} type type
 *
 * @typedef {TextMessage|MultipleMessage|FollowMessage} Message message
 *
 * @typedef {'message'} EventType event type
 *
 * @typedef {Object} QuickReply
 * @property {!string[]} texts reply texts
 */

/**
 * @interface IClient interface of client
 */
export default class IClient {
    /**
     * send method
     * @virtual
     * @param {Message[]} messages messages
     */
    async send(messages) {

    }

    /**
     * @virtual
     * @param {EventType} event event type
     * @param {function} listener listener function
     */
    on(event, listener) {

    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BravoCommunicator = exports.AuthToken = void 0;
const js_sdk_1 = require("@xano/js-sdk");
const realtime_action_1 = require("@xano/js-sdk/lib/enums/realtime-action");
const realtime_state_1 = require("@xano/js-sdk/lib/models/realtime-state");
const uuid_1 = require("uuid");
class AuthToken {
    token;
    constructor(token) {
        this.token = token;
    }
}
exports.AuthToken = AuthToken;
class BravoIdentifier {
    id;
    group;
    name;
    constructor(user_identifier, name) {
        this.id = (0, uuid_1.v4)();
        this.name = name;
        this.group = user_identifier;
    }
    get_id() {
        return this.id;
    }
    get_authtoken() {
        if (this.group instanceof AuthToken) {
            return this.group;
        }
        return null;
    }
    get_group() {
        if (!(this.group instanceof AuthToken)) {
            return this.group;
        }
        return null;
    }
    create_message(message) {
        return new BravoMessage(message, this);
    }
    get_name() {
        return this.name;
    }
}
class BravoMessage {
    message;
    sender_id;
    reciver_id;
    constructor(message, sender, receiver) {
        this.message = message;
        this.sender_id = sender;
        this.reciver_id = receiver;
    }
    data() {
        return this.message;
    }
    from() {
        return this.sender_id.get_name();
    }
    to() {
        return this.reciver_id.get_name();
    }
}
class BroadCastMe {
    me;
    constructor(me) {
        this.me = me;
    }
    get_me() {
        return this.me;
    }
}
class BravoCommunicator {
    signer;
    realtime_channel;
    handler;
    err_handler;
    peers = new Map();
    constructor(config) {
        const xano_client = new js_sdk_1.XanoClient(config.config);
        this.realtime_channel = xano_client.channel(config.xano_channel_name, {
            presence: true,
        });
        this.realtime_channel.message(new BroadCastMe(this.signer));
        this.signer = new BravoIdentifier(config.group, config.page_name);
        this.handler = config.handler;
        this.err_handler = config.err_handler;
        this.realtime_channel.on(realtime_action_1.ERealtimeAction.Message, this.on_recieve.bind(this), this.err_handler);
        this.realtime_channel.on(realtime_action_1.ERealtimeAction.Join, this.on_join.bind(this));
    }
    on_join() {
        this.realtime_channel.message(new BroadCastMe(this.signer), {
            channel: this.realtime_channel.channel
        });
    }
    on_recieve(action) {
        const message = action.payload;
        if (message instanceof BroadCastMe) {
            if (this.peers.get(message.get_me().get_name())) {
                this.peers.set(message.get_me().get_id(), message.get_me());
                return;
            }
            else {
                this.peers.set(message.get_me().get_name() ?? message.get_me().get_id(), message.get_me());
                return;
            }
        }
        if (!(message instanceof BravoMessage)) {
            return;
        }
        if (!(message.reciver_id && message.reciver_id === this.signer)) {
            return;
        }
        // If the message is authenticated by an
        // auth token but the reciver does not belong
        // to a user group, skip
        if (message.sender_id.get_group() && this.signer instanceof AuthToken) {
            return;
        }
        if (message.sender_id.get_authtoken() && !(this.signer instanceof AuthToken)) {
            return;
        }
        if (!(message.sender_id.get_group() === this.signer.get_group())) {
            return;
        }
        this.handler(message);
    }
    send_message(bravo_message) {
        this.realtime_channel.message(bravo_message, {
            channel: this.realtime_channel.channel
        });
    }
    broadcast_message(message) {
        const bravo_message = new BravoMessage(message, this.signer);
        let interval = setInterval(() => {
            if (realtime_state_1.XanoRealtimeState.getInstance().getSocket().readyState === WebSocket.OPEN) {
                this.send_message.bind(this, bravo_message);
                clearInterval(interval);
            }
        }, 100);
    }
    send_message_to_recipient(message, recipient) {
        const reciver = this.peers.get(recipient);
        if (!reciver) {
            this.err_handler({
                action: realtime_action_1.ERealtimeAction.Message,
                payload: {
                    message: "Recipient not found"
                }
            });
            return;
        }
        const bravo_message = new BravoMessage(message, this.signer, reciver);
        let interval = setInterval(() => {
            if (realtime_state_1.XanoRealtimeState.getInstance().getSocket().readyState === WebSocket.OPEN) {
                this.send_message.bind(this, bravo_message);
                clearInterval(interval);
            }
        }, 100);
    }
}
exports.BravoCommunicator = BravoCommunicator;

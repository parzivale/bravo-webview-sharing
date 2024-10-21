"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BravoCommunicator = exports.Deserializer = exports.Serializable = void 0;
const js_sdk_1 = require("@xano/js-sdk");
const realtime_action_1 = require("@xano/js-sdk/lib/enums/realtime-action");
const uuid_1 = require("uuid");
const class_transformer_1 = require("class-transformer");
require("reflect-metadata");
class Serializable {
    type;
    type_id() {
        return this.type;
    }
    ;
    serialize() {
        let plain_item = (0, class_transformer_1.instanceToPlain)(this);
        return JSON.stringify(plain_item);
    }
}
exports.Serializable = Serializable;
class Deserializer {
    class_constructor;
    constructor(class_constructor) {
        this.class_constructor = class_constructor;
    }
    deserialize(plainObject) {
        try {
            let parsed_object = JSON.parse(plainObject); // Check if the string is a valid JSON
            if (parsed_object.type !== new this.class_constructor().type_id()) {
                return null;
            }
            // Convert plain object to class instance
            let instance_ = (0, class_transformer_1.plainToInstance)(this.class_constructor, parsed_object);
            if (!(instance_ instanceof this.class_constructor)) {
                throw new Error("Deserialization failed, object is not instance of class: " + instance_);
            }
            return instance_;
        }
        catch (error) {
            return null; // Return null if deserialization fails
        }
    }
}
exports.Deserializer = Deserializer;
class BravoIdentifier extends Serializable {
    type = "BravoIdentifier";
    id;
    group;
    name;
    constructor(user_identifier, name) {
        super();
        this.id = (0, uuid_1.v4)();
        this.name = name;
        this.group = user_identifier;
    }
    get_id() {
        return this.id;
    }
    get_group() {
        return this.group;
    }
    get_name() {
        return this.name;
    }
}
class BravoMessage extends Serializable {
    type = "BravoMessage";
    message;
    sender_id;
    reciver_id;
    constructor(message, sender, receiver) {
        super();
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
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => BravoIdentifier),
    __metadata("design:type", BravoIdentifier)
], BravoMessage.prototype, "sender_id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => BravoIdentifier),
    __metadata("design:type", BravoIdentifier)
], BravoMessage.prototype, "reciver_id", void 0);
class BroadCastMe extends Serializable {
    type = "BroadCastMe";
    me;
    constructor(me) {
        super();
        this.me = me;
    }
    get_me() {
        return this.me;
    }
}
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => BravoIdentifier),
    __metadata("design:type", BravoIdentifier)
], BroadCastMe.prototype, "me", void 0);
class BroadCastResponseMe extends Serializable {
    type = "BroadCastResponseMe";
    me;
    reciver;
    constructor(me, reciver) {
        super();
        this.me = me;
        this.reciver = reciver;
    }
    get_me() {
        return this.me;
    }
    get_reciver() {
        return this.reciver;
    }
}
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => BravoIdentifier),
    __metadata("design:type", BravoIdentifier)
], BroadCastResponseMe.prototype, "me", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => BravoIdentifier),
    __metadata("design:type", BravoIdentifier)
], BroadCastResponseMe.prototype, "reciver", void 0);
class BravoCommunicator {
    signer;
    realtime_channel;
    handler;
    err_handler;
    peers = new Map();
    joined = false;
    message_class_constructor;
    deserializer_message = new Deserializer(BravoMessage);
    deserializer_me = new Deserializer(BroadCastMe);
    deserializer_broadcast_response = new Deserializer(BroadCastResponseMe);
    deserializer_message_inner;
    constructor(config) {
        if (global.XanoClient) {
            throw new Error("Only one xano client can be active per browser");
        }
        this.message_class_constructor = config.class;
        this.deserializer_message_inner = new Deserializer(this.message_class_constructor);
        const xano_client = new js_sdk_1.XanoClient(config.config);
        this.realtime_channel = xano_client.channel(config.xano_channel_name, {
            presence: true,
        });
        this.signer = new BravoIdentifier(config.group, config.page_name);
        this.handler = config.handler;
        this.err_handler = config.err_handler;
        this.realtime_channel = this.realtime_channel.on(realtime_action_1.ERealtimeAction.Message, this.on_recieve.bind(this), this.err_handler.bind(this));
        this.realtime_channel = this.realtime_channel.on(realtime_action_1.ERealtimeAction.PresenceFull, this.on_join.bind(this));
    }
    deepEqual(obj1, obj2) {
        if (obj1 === obj2)
            return true; // Same reference or primitive value
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
            return false;
        }
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (const key of keys1) {
            if (!keys2.includes(key) || !this.deepEqual(obj1[key], obj2[key])) {
                return false;
            }
        }
        return true;
    }
    on_join() {
        this.realtime_channel.message(new BroadCastMe(this.signer).serialize());
        this.joined = true;
    }
    async on_recieve(action) {
        if (this.deserializer_message.deserialize(action.payload)) {
            const message = this.deserializer_message.deserialize(action.payload);
            if (message.sender_id.get_id() === this.signer.get_id()) {
                return;
            }
            if (message.reciver_id && !(message.reciver_id === this.signer)) {
                return;
            }
            if (!message.reciver_id && !(this.deepEqual(message.sender_id.get_group(), this.signer.get_group()))) {
                return;
            }
            let deserialized = this.deserializer_message_inner.deserialize(JSON.stringify(message.message));
            this.handler(deserialized);
        }
        if (this.deserializer_me.deserialize(action.payload)) {
            const message = this.deserializer_me.deserialize(action.payload);
            const me = message.get_me();
            const id = me.get_id();
            if (this.signer.get_id() === id) {
                return;
            }
            const name = me.get_name();
            if (this.peers.get(name)) {
                this.peers.set(id, me);
            }
            else {
                this.peers.set(name ?? id, me);
            }
            await this.send_broadcast_response(new BroadCastResponseMe(this.signer, me));
            return;
        }
        if (this.deserializer_broadcast_response.deserialize(action.payload)) {
            const message = this.deserializer_broadcast_response.deserialize(action.payload);
            if (message.get_reciver().get_id() === this.signer.get_id()) {
                return;
            }
            if (this.peers.get(message.get_me().get_name())) {
                this.peers.set(message.get_me().get_id(), message.get_me());
            }
            else {
                this.peers.set(message.get_me().get_name() ?? message.get_me().get_id(), message.get_me());
            }
            return;
        }
    }
    async has_joined() {
        return new Promise((resolve, reject) => {
            let interval;
            let timeout;
            interval = setInterval(() => {
                if (this.joined) {
                    resolve(true);
                    clearInterval(interval);
                    clearTimeout(timeout);
                }
            }, 100);
            timeout = setTimeout(() => {
                reject(false);
                clearInterval(interval);
                clearTimeout(timeout);
            }, 10000);
        });
    }
    async send_message(bravo_message) {
        if (await this.has_joined()) {
            this.realtime_channel.message(bravo_message.serialize());
        }
        else {
            throw new Error("Could not join channel, channel timed out");
        }
    }
    async send_broadcast_response(message) {
        const serialized = message.serialize();
        this.realtime_channel.message(serialized);
    }
    async broadcast_message(message) {
        const bravo_message = new BravoMessage(message, this.signer);
        return this.send_message(bravo_message);
    }
    async send_message_to_recipient_signer(message, recipient) {
        const bravo_message = new BravoMessage(message, recipient);
        return this.send_message(bravo_message);
    }
    async send_message_to_recipient(message, recipient) {
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
        return this.send_message(bravo_message);
    }
}
exports.BravoCommunicator = BravoCommunicator;

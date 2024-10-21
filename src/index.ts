import { XanoClient, XanoClientConfig } from "@xano/js-sdk";
import { ERealtimeAction } from "@xano/js-sdk/lib/enums/realtime-action";
import { XanoRealtimeActionOptions } from "@xano/js-sdk/lib/interfaces/realtime-action-options";
import { XanoRealtimeClient } from "@xano/js-sdk/lib/interfaces/realtime-client";
import { XanoRealtimeChannel } from "@xano/js-sdk/lib/models/realtime-channel";
import { v4 as uuidv4 } from 'uuid';
import { Expose, Type, instanceToPlain, ClassConstructor, plainToInstance } from 'class-transformer';
import "reflect-metadata";


/// This class must be extended by the message class for the Bravo communicator
/// to be able to deserialize your message class
export abstract class Serializable {
    /// This type should be unique for each class that extends Serializable
    /// Do you not need to worry about colliding with the builtin types for
    /// this pacakge as the messages are sent wrapped in a BravoMessage
    /// To extend this to your own nested classes type reflection is needed
    /// we currently do this with the reflect-metadata package and the
    /// class-transformer package, the latter has good documentation on how to
    /// use it
    type: string;

    public type_id(): string {
        return this.type;
    };

    public serialize(): string {
        let plain_item = instanceToPlain(this);
        return JSON.stringify(plain_item);
    }
}


export class Deserializer<T extends Serializable> {
    private class_constructor: ClassConstructor<T>;

    constructor(class_constructor: ClassConstructor<T>) {
        this.class_constructor = class_constructor;
    }


    /// If deseriliztion fails it will return null
    /// but if it succeeds deserializtion but returns a
    /// class that isn't defined by the class constructor it will throw an error
    public deserialize(plainObject: string): T | null {

        try {
            let parsed_object: T = JSON.parse(plainObject);  // Check if the string is a valid JSON
            if (parsed_object.type !== new this.class_constructor().type_id()) {
                return null;
            }


            // Convert plain object to class instance
            let instance_ = plainToInstance(this.class_constructor, parsed_object);
            if (!(instance_ instanceof this.class_constructor)) {
                throw new Error("Deserialization failed, object is not instance of class: " + instance_);
            }



            return instance_;
        } catch (error) {
            return null;  // Return null if deserialization fails
        }
    }
}

export interface XanoRealtimeAction {
    action: ERealtimeAction;
    client?: XanoRealtimeClient;
    options?: XanoRealtimeActionOptions;
    payload: any;
}

export interface BravoCommunicatorConfig<T extends Serializable, Identifier> {
    /// The channel name in your xano instance, the channel needs to be setup
    ///  with presence enabled
    xano_channel_name: string,
    /// This is the communication group the communicator will talk on.
    /// This can be a user id, a group id or any other identifier
    /// however if it is a class it will always match
    /// the same class reegardless of the data in said instance
    /// for situations where the group needs to convey more information
    /// please use an interface
    group: Identifier,
    /// This is used to identify the communicator to send messages directly to it
    /// in the peer identification process this will be used to set the key in the
    /// peer map otherwise it will use the generated id
    page_name?: string,
    config: Partial<XanoClientConfig>,
    class: ClassConstructor<T>,
    handler: (message: T) => void,

    /// Defaults to logging the error
    err_handler?: (error: any) => void
}

/// The identifier for a page/webview
class BravoIdentifier<Identifier> extends Serializable {
    type: string = "BravoIdentifier";
    private id: string;
    private group: Identifier
    private name?: string;

    constructor(user_identifier: Identifier, name?: string) {
        super();
        this.id = uuidv4();
        this.name = name;
        this.group = user_identifier;
    }

    public get_id(): string {
        return this.id;
    }

    public get_group(): Identifier {
        return this.group;
    }

    public get_name(): string | null {
        return this.name;
    }
}


class BravoMessage<T extends Serializable, Identifier> extends Serializable {
    type: string = "BravoMessage";
    message: T;
    @Expose()
    @Type(() => BravoIdentifier<Identifier>)
    sender_id: BravoIdentifier<Identifier>;
    @Expose()
    @Type(() => BravoIdentifier<Identifier>)
    reciver_id?: BravoIdentifier<Identifier>;
    constructor(message: T, sender: BravoIdentifier<Identifier>, receiver?: BravoIdentifier<Identifier>) {
        super();
        this.message = message;
        this.sender_id = sender;
        this.reciver_id = receiver;
    }

    public data(): T {
        return this.message
    }

    public from(): string | null {
        return this.sender_id.get_name();
    }

    public to(): string | null {
        return this.reciver_id.get_name();
    }
}



class BroadCastMe<Identifier> extends Serializable {
    type: string = "BroadCastMe";

    @Expose()
    @Type(() => BravoIdentifier<Identifier>)
    private me: BravoIdentifier<Identifier>;

    constructor(me: BravoIdentifier<Identifier>) {
        super();
        this.me = me;
    }

    public get_me(): BravoIdentifier<Identifier> {
        return this.me;
    }

}

class BroadCastResponseMe<Identifier> extends Serializable {
    type: string = "BroadCastResponseMe";

    @Expose()
    @Type(() => BravoIdentifier<Identifier>)
    private me: BravoIdentifier<Identifier>;
    @Expose()
    @Type(() => BravoIdentifier<Identifier>)
    private reciver: BravoIdentifier<Identifier>;

    constructor(me: BravoIdentifier<Identifier>, reciver: BravoIdentifier<Identifier>) {
        super();
        this.me = me;
        this.reciver = reciver;
    }

    public get_me(): BravoIdentifier<Identifier> {
        return this.me;
    }

    public get_reciver(): BravoIdentifier<Identifier> {
        return this.reciver;
    }

}


export class BravoCommunicator<T extends Serializable, Identifier> {
    private signer: BravoIdentifier<Identifier>;
    private realtime_channel: XanoRealtimeChannel;
    private handler: (message: T) => void;
    private err_handler: (error: XanoRealtimeAction) => void;
    /// The bravo communicator uses a peer detection system to allow for
    /// direct messaging between peers, this is done by sending a broadcast
    /// message to the channel and waiting for a response from the peers
    /// If a peer joins the channel the communicator also stores the peer
    /// and sends a response to the peer to let them know we are here
    private peers = new Map<string, BravoIdentifier<any>>();
    private joined: boolean = false;
    private message_class_constructor: ClassConstructor<T>;


    private deserializer_message = new Deserializer<BravoMessage<T, Identifier>>(BravoMessage);
    private deserializer_me = new Deserializer<BroadCastMe<Identifier>>(BroadCastMe);


    private deserializer_broadcast_response = new Deserializer<BroadCastResponseMe<Identifier>>(BroadCastResponseMe);
    private deserializer_message_inner: Deserializer<T>;

    constructor(config: BravoCommunicatorConfig<T, Identifier>) {

        /// is constraint is from xano not us, we chose to throw the error early
        if (global.XanoClient) {
            throw new Error("Only one xano client can be active per browser")
        }
        this.message_class_constructor = config.class;
        this.deserializer_message_inner = new Deserializer<T>(this.message_class_constructor);

        const xano_client = new XanoClient(config.config);
        this.realtime_channel = xano_client.channel(config.xano_channel_name, {
            presence: true,
        });


        this.signer = new BravoIdentifier(config.group, config.page_name);

        this.handler = config.handler;
        this.err_handler = config.err_handler ?? ((error) => {console.error(error)});
        /// We bypass most of xanos event system since this package
        /// is intended to be used with as little interaction with
        /// xano as possible
        this.realtime_channel = this.realtime_channel.on(ERealtimeAction.Message, this.on_recieve.bind(this), this.err_handler.bind(this));
        /// We use presence to detect when the socket is ready to send messages
        /// Ideally we would use the connection status event, but it does
        /// not seem to be reliably sent
        this.realtime_channel = this.realtime_channel.on(ERealtimeAction.PresenceFull, this.on_join.bind(this));
    }


    /// Function I pulled from chatgpt to compare objects
    private deepEqual(obj1: any, obj2: any): boolean {
        if (obj1 === obj2) return true; // Same reference or primitive value
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

    private on_join() {
        this.realtime_channel.message(new BroadCastMe(this.signer).serialize());
        this.joined = true;
    }

    private async on_recieve(action: XanoRealtimeAction) {
        if (this.deserializer_message.deserialize(action.payload)) {
            const message: BravoMessage<T, Identifier> = this.deserializer_message.deserialize(action.payload);

            /// If its from us discard the message
            if (message.sender_id.get_id() === this.signer.get_id()) {
                return;
            }

            /// If its a direct message but we aren't the reciver discard the message
            if (message.reciver_id && !(message.reciver_id === this.signer)) {
                return;
            }

            /// If its a group message but we aren't in the group discard the message
            if (!message.reciver_id && !(this.deepEqual(message.sender_id.get_group(), this.signer.get_group()))) {
                return;
            }

            let deserialized = this.deserializer_message_inner.deserialize(JSON.stringify(message.message));
            this.handler(deserialized);
        }

        /// Broadcast message handler
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
            } else {
                this.peers.set(name ?? id, me);
            }

            await this.send_broadcast_response(new BroadCastResponseMe(this.signer, me));
            return;
        }

        /// Broadcast response message handler
        if (this.deserializer_broadcast_response.deserialize(action.payload)) {
            const message = this.deserializer_broadcast_response.deserialize(action.payload);
            if (message.get_reciver().get_id() === this.signer.get_id()) {
                return;
            }

            if (this.peers.get(message.get_me().get_name())) {
                this.peers.set(message.get_me().get_id(), message.get_me());
            } else {
                this.peers.set(message.get_me().get_name() ?? message.get_me().get_id(), message.get_me());

            }
            return;
        }
    }

    /// This is needed as it takes a while for the channel to be ready
    /// after we initiate the connection
    /// the 10 second timeout is arbitrary, but it should be enough time
    /// this may require a better timeout handler at somepoint

    private async has_joined(): Promise<boolean> {
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

    private async send_message(bravo_message: BravoMessage<T, Identifier>) {
        if (await this.has_joined()) {
            this.realtime_channel.message(bravo_message.serialize());
        } else {
            throw new Error("Could not join channel, channel timed out");
        }
    }

    private async send_broadcast_response(message: BroadCastResponseMe<Identifier>) {
        const serialized = message.serialize();
        this.realtime_channel.message(serialized);
    }

    public async broadcast_message(message: T) {
        const bravo_message = new BravoMessage(message, this.signer);
        return this.send_message(bravo_message)
    }

    /// This method bypasses the group check to allow sending messages to different groups
    public async send_message_to_recipient_signer(message: T, recipient: BravoIdentifier<Identifier>) {
        const bravo_message = new BravoMessage(message, recipient);
        return this.send_message(bravo_message)
    }

    /// Same as method above, bypasses the group check to allow sending messages to different groups
    public async send_message_to_recipient(message: T, recipient: string) {
        const reciver = this.peers.get(recipient);
        if (!reciver) {
            this.err_handler({
                action: ERealtimeAction.Message,
                payload: {
                    message: "Recipient not found"
                }
            });
            return;
        }
        const bravo_message = new BravoMessage(message, this.signer, reciver);
        return this.send_message(bravo_message)
    }
}

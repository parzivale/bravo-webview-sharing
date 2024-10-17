import { XanoClient, XanoClientConfig, XanoSessionStorage } from "@xano/js-sdk";
import { ERealtimeAction } from "@xano/js-sdk/lib/enums/realtime-action";
import { XanoRealtimeActionOptions } from "@xano/js-sdk/lib/interfaces/realtime-action-options";
import { XanoRealtimeClient } from "@xano/js-sdk/lib/interfaces/realtime-client";
import { XanoRealtimeChannel } from "@xano/js-sdk/lib/models/realtime-channel";
import { XanoRealtimeState } from "@xano/js-sdk/lib/models/realtime-state";
import { v4 as uuidv4 } from 'uuid';
export interface XanoRealtimeAction {
    action: ERealtimeAction;
    client?: XanoRealtimeClient;
    options?: XanoRealtimeActionOptions;
    payload: any;
}

export class AuthToken {
    token: string;
    constructor(token: string) {
        this.token = token;
    }
}


export interface BravoCommunicatorConfig<T, Identifier> {
    xano_channel_name: string,
    group: AuthToken | Identifier,
    page_name?: string,
    config: Partial<XanoClientConfig>
    handler: (message: BravoMessage<T, Identifier>) => void,
    err_handler: (error: any) => void
}

class BravoIdentifier<T, Identifier> {
    private id: string;
    private group: AuthToken | Identifier
    private name?: string;
    constructor(user_identifier: AuthToken | Identifier, name?: string) {
        this.id = uuidv4();
        this.name = name;
        this.group = user_identifier;
    }

    public get_id(): string {
        return this.id;
    }

    public get_authtoken(): AuthToken | null {
        if (this.group instanceof AuthToken) {
            return this.group;
        }
        return null;
    }

    public get_group(): Identifier | null {
        if (!(this.group instanceof AuthToken)) {
            return this.group;
        }
        return null;
    }

    public create_message(message: T): BravoMessage<T, Identifier> {
        return new BravoMessage(message, this);
    }

    public get_name(): string | null {
        return this.name;
    }
}

class BravoMessage<T, Identifier> {
    message: T;
    sender_id: BravoIdentifier<T, Identifier>;
    reciver_id?: BravoIdentifier<T, Identifier>;
    constructor(message: T, sender: BravoIdentifier<T, Identifier>, receiver?: BravoIdentifier<T, Identifier>) {
        this.message = message;
        this.sender_id = sender;
        this.reciver_id = receiver;
    }

    public data(): T {
        return this.message;
    }

    public from(): string | null {
        return this.sender_id.get_name();
    }

    public to(): string | null {
        return this.reciver_id.get_name();
    }
}

class BroadCastMe<T, Identifier> {
    private me: BravoIdentifier<T, Identifier>;

    constructor(me: BravoIdentifier<T, Identifier>) {
        this.me = me;
    }

    public get_me(): BravoIdentifier<T, Identifier> {
        return this.me;
    }

}

export class BravoCommunicator<T, Identifier> {
    private signer: BravoIdentifier<T, Identifier>;
    private realtime_channel: XanoRealtimeChannel;
    private handler: (message: BravoMessage<T, Identifier>) => void;
    private err_handler: (error: XanoRealtimeAction) => void;
    private peers = new Map<string, BravoIdentifier<T, Identifier>>();

    constructor(config: BravoCommunicatorConfig<T, Identifier>) {
        const xano_client = new XanoClient(config.config);
        this.realtime_channel = xano_client.channel(config.xano_channel_name, {
            presence: true,
        });

        this.realtime_channel.message(new BroadCastMe(this.signer));
        this.signer = new BravoIdentifier(config.group, config.page_name);

        this.handler = config.handler;
        this.err_handler = config.err_handler;

        this.realtime_channel.on(ERealtimeAction.Message, this.on_recieve.bind(this), this.err_handler);

        this.realtime_channel.on(ERealtimeAction.Join, this.on_join.bind(this));
    }

    private on_join() {
        this.realtime_channel.message(new BroadCastMe(this.signer), {
            channel: this.realtime_channel.channel
        });
    }

    private on_recieve(action: XanoRealtimeAction) {
        const message = action.payload;

        if (message instanceof BroadCastMe) {
            if (this.peers.get(message.get_me().get_name())) {
                this.peers.set(message.get_me().get_id(), message.get_me());
                return;
            } else {
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

    private send_message(bravo_message: BravoMessage<T, Identifier>) {
        this.realtime_channel.message(bravo_message, {
            channel: this.realtime_channel.channel
        });
    }

    public broadcast_message(message: T) {
        const bravo_message = new BravoMessage(message, this.signer);

        let interval = setInterval(() => {
                if (XanoRealtimeState.getInstance().getSocket().readyState === WebSocket.OPEN) {
                    this.send_message.bind(this, bravo_message);
                    clearInterval(interval)
                }
            }, 100);
    }

    public send_message_to_recipient(message: T, recipient: string) {
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

        let interval = setInterval(() => {
            if (XanoRealtimeState.getInstance().getSocket().readyState === WebSocket.OPEN) {
                this.send_message.bind(this, bravo_message);
                clearInterval(interval)
            }
        }, 100);
    }
}

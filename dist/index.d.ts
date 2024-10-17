import { XanoClientConfig } from "@xano/js-sdk";
import { ERealtimeAction } from "@xano/js-sdk/lib/enums/realtime-action";
import { XanoRealtimeActionOptions } from "@xano/js-sdk/lib/interfaces/realtime-action-options";
import { XanoRealtimeClient } from "@xano/js-sdk/lib/interfaces/realtime-client";
export interface XanoRealtimeAction {
    action: ERealtimeAction;
    client?: XanoRealtimeClient;
    options?: XanoRealtimeActionOptions;
    payload: any;
}
export declare class AuthToken {
    token: string;
    constructor(token: string);
}
export interface BravoCommunicatorConfig<T, Identifier> {
    xano_channel_name: string;
    group: AuthToken | Identifier;
    page_name?: string;
    config: Partial<XanoClientConfig>;
    handler: (message: BravoMessage<T, Identifier>) => void;
    err_handler: (error: any) => void;
}
declare class BravoIdentifier<T, Identifier> {
    private id;
    private group;
    private name?;
    constructor(user_identifier: AuthToken | Identifier, name?: string);
    get_id(): string;
    get_authtoken(): AuthToken | null;
    get_group(): Identifier | null;
    create_message(message: T): BravoMessage<T, Identifier>;
    get_name(): string | null;
}
declare class BravoMessage<T, Identifier> {
    message: T;
    sender_id: BravoIdentifier<T, Identifier>;
    reciver_id?: BravoIdentifier<T, Identifier>;
    constructor(message: T, sender: BravoIdentifier<T, Identifier>, receiver?: BravoIdentifier<T, Identifier>);
    data(): T;
    from(): string | null;
    to(): string | null;
}
export declare class BravoCommunicator<T, Identifier> {
    private signer;
    private realtime_channel;
    private handler;
    private err_handler;
    private peers;
    constructor(config: BravoCommunicatorConfig<T, Identifier>);
    private on_join;
    private on_recieve;
    private send_message;
    broadcast_message(message: T): void;
    send_message_to_recipient(message: T, recipient: string): void;
}
export {};

import { XanoClientConfig } from "@xano/js-sdk";
import { ERealtimeAction } from "@xano/js-sdk/lib/enums/realtime-action";
import { XanoRealtimeActionOptions } from "@xano/js-sdk/lib/interfaces/realtime-action-options";
import { XanoRealtimeClient } from "@xano/js-sdk/lib/interfaces/realtime-client";
import { ClassConstructor } from 'class-transformer';
import "reflect-metadata";
export declare abstract class Serializable {
    type: string;
    type_id(): string;
    serialize(): string;
}
export declare class Deserializer<T extends Serializable> {
    private class_constructor;
    constructor(class_constructor: ClassConstructor<T>);
    deserialize(plainObject: string): T | null;
}
export interface XanoRealtimeAction {
    action: ERealtimeAction;
    client?: XanoRealtimeClient;
    options?: XanoRealtimeActionOptions;
    payload: any;
}
export interface BravoCommunicatorConfig<T extends Serializable, Identifier> {
    xano_channel_name: string;
    group: Identifier;
    page_name?: string;
    config: Partial<XanoClientConfig>;
    class: ClassConstructor<T>;
    handler: (message: T) => void;
    err_handler: (error: any) => void;
}
declare class BravoIdentifier<Identifier> extends Serializable {
    type: string;
    private id;
    private group;
    private name?;
    constructor(user_identifier: Identifier, name?: string);
    get_id(): string;
    get_group(): Identifier;
    get_name(): string | null;
}
export declare class BravoCommunicator<T extends Serializable, Identifier> {
    private signer;
    private realtime_channel;
    private handler;
    private err_handler;
    private peers;
    private joined;
    private message_class_constructor;
    private deserializer_message;
    private deserializer_me;
    private deserializer_broadcast_response;
    private deserializer_message_inner;
    constructor(config: BravoCommunicatorConfig<T, Identifier>);
    private deepEqual;
    private on_join;
    private on_recieve;
    private has_joined;
    private send_message;
    private send_broadcast_response;
    broadcast_message(message: T): Promise<void>;
    send_message_to_recipient_signer(message: T, recipient: BravoIdentifier<Identifier>): Promise<void>;
    send_message_to_recipient(message: T, recipient: string): Promise<void>;
}
export {};

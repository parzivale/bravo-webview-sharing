import { XanoClientConfig } from "./interfaces/client-config";
import { XanoRealtimeChannel } from "./models/realtime-channel";
import { XanoRealtimeChannelOptions } from "./interfaces/realtime-channel-options";
import { XanoResponse } from "./models/response";
import { XanoStreamingCallback } from "./types/xano-streaming-callback.type";
export declare abstract class XanoBaseClient {
    private config;
    constructor(config: Partial<XanoClientConfig>);
    protected abstract getFormDataInstance(): any;
    protected abstract appendFormData(formData: any, key: string, value: any): void;
    private buildFormData;
    private hasToken;
    private isFileType;
    private request;
    private storeToken;
    hasAuthToken(): boolean;
    setAuthToken(authToken: string | null): this;
    hasRealtimeAuthToken(): boolean;
    setRealtimeAuthToken(authToken: string | null): this;
    hasDataSource(): boolean;
    setDataSource(dataSource: string | null): this;
    delete(endpoint: string, params?: Record<any, any>, headers?: Record<any, any>): Promise<XanoResponse>;
    get(endpoint: string, params?: Record<any, any>, headers?: Record<any, any>, streamingCallback?: XanoStreamingCallback): Promise<XanoResponse>;
    head(endpoint: string, params?: Record<any, any>, headers?: Record<any, any>): Promise<XanoResponse>;
    patch(endpoint: string, params?: Record<any, any>, headers?: Record<any, any>, streamingCallback?: XanoStreamingCallback): Promise<XanoResponse>;
    post(endpoint: string, params?: Record<any, any>, headers?: Record<any, any>, streamingCallback?: XanoStreamingCallback): Promise<XanoResponse>;
    put(endpoint: string, params?: Record<any, any>, headers?: Record<any, any>, streamingCallback?: XanoStreamingCallback): Promise<XanoResponse>;
    channel(channel: string, options?: Partial<XanoRealtimeChannelOptions>): XanoRealtimeChannel;
    realtimeReconnect(): this;
}
//# sourceMappingURL=base-client.d.ts.map
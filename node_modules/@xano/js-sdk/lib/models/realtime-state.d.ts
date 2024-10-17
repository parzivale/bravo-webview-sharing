import { Observable } from "./observable";
import { XanoClientConfig } from "../interfaces/client-config";
import { XanoRealtimeAction } from "../interfaces/realtime-action";
export declare class XanoRealtimeState {
    private static _instance;
    private config;
    private socket;
    private reconnectSettings;
    private socketObserver;
    constructor();
    static getInstance(): XanoRealtimeState;
    private triggerReconnect;
    private connect;
    private disconnect;
    reconnect(): void;
    getSocket(): WebSocket | null;
    setConfig(config: XanoClientConfig): this;
    getSocketObserver(): Observable<XanoRealtimeAction>;
}
//# sourceMappingURL=realtime-state.d.ts.map
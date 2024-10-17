import { XanoRealtimeChannel } from "./realtime-channel";
import { XanoRealtimeClient as IXanoRealtimeClient } from "../interfaces/realtime-client";
export declare class XanoRealtimeClient implements IXanoRealtimeClient {
    private readonly channel;
    extras: Record<string, any>;
    permissions: {
        dbo_id: number;
        row_id: number;
    };
    socketId: string;
    constructor(client: IXanoRealtimeClient, channel: XanoRealtimeChannel);
    message(payload: any): void;
    history(): void;
}
//# sourceMappingURL=realtime-client.d.ts.map
import { ERealtimeAction } from "../enums/realtime-action";
import { XanoRealtimeActionOptions } from "./realtime-action-options";
import { XanoRealtimeClient } from "./realtime-client";
export interface XanoRealtimeAction {
    action: ERealtimeAction;
    client?: XanoRealtimeClient;
    options?: XanoRealtimeActionOptions;
    payload: any;
}
//# sourceMappingURL=realtime-action.d.ts.map
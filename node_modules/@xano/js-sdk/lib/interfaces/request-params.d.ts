import { XanoRequestType } from "../enums/request-type";
import { XanoStreamingCallback } from "../types/xano-streaming-callback.type";
export interface XanoRequestParams {
    bodyParams?: Record<any, any>;
    endpoint: string;
    headerParams?: Record<any, any>;
    method: XanoRequestType;
    streamingCallback?: XanoStreamingCallback;
    urlParams?: Record<any, any>;
}
//# sourceMappingURL=request-params.d.ts.map
import { XanoResponse } from "../models/response";
export declare class XanoRequestError extends Error {
    getResponse: () => XanoResponse;
    constructor(message: string, response: XanoResponse);
}
//# sourceMappingURL=request.d.ts.map
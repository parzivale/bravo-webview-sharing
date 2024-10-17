import { XanoBaseClient } from "./base-client";
import { XanoClientConfig } from "./interfaces/client-config";
export declare class XanoClient extends XanoBaseClient {
    constructor(config: Partial<XanoClientConfig>);
    protected getFormDataInstance(): any;
    protected appendFormData(formData: any, key: string, value: any): void;
}
//# sourceMappingURL=client.d.ts.map
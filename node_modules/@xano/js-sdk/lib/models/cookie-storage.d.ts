import { XanoBaseStorage } from "./base-storage";
export declare class XanoCookieStorage extends XanoBaseStorage {
    private cookiePath;
    private expirationDays;
    constructor(cookiePath?: string, expirationDays?: number);
    private getExpirationUTC;
    clear(): void;
    getAll(): Record<string, string>;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    setItem(key: string, value: string): void;
}
//# sourceMappingURL=cookie-storage.d.ts.map
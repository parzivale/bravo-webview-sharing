import { XanoBaseStorage } from "./base-storage";
export declare class XanoObjectStorage extends XanoBaseStorage {
    private storage;
    clear(): void;
    getAll(): Record<string, string>;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    setItem(key: string, value: string): void;
}
//# sourceMappingURL=object-storage.d.ts.map
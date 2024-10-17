import { XanoBaseStorage } from "./base-storage";
export declare class XanoLocalStorage extends XanoBaseStorage {
    clear(): void;
    getAll(): Record<string, string>;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    setItem(key: string, value: string): void;
}
//# sourceMappingURL=local-storage.d.ts.map
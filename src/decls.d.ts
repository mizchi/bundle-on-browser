/* === Ignore === */

declare module "rollup-plugin-url-resolve";
declare module "monaco-typescript/*";
declare module "kv-storage-polyfill" {
  export class StorageArea<K, V> {
    constructor(area: string);
    entries(): Array<Promise<[K, V]>>;
    clear(): Promise<void>;
    delete(key: K): Promise<void>;
    get(key: K): Promise<V>;
    set(key: K, value: V): Promise<void>;
  }
  export const storage: StorageArea<any, any>;
}

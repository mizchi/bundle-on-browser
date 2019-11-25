import { StorageArea } from "kv-storage-polyfill";

const NPM_STORAGE_VERSION = 1;
const NPM_STORAGE_KEY = `npm:${NPM_STORAGE_VERSION}`;

export const npmCache = new StorageArea<string, string>(NPM_STORAGE_KEY);

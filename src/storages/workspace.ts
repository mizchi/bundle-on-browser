import { StorageArea } from "kv-storage-polyfill";

const WORKSPACE_VERSION = 1;
const WORKSPACE_KEY = `ws:${WORKSPACE_VERSION}`;

export type PersistedWorkspace = {
  workspaceId: string;
  files: { [k: string]: string };
};

export const workspace = new StorageArea<string, PersistedWorkspace>(
  WORKSPACE_KEY
);

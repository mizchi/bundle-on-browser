import { StorageArea } from "kv-storage-polyfill";

const FS_STORAGE_VERSION = 1;
const FS_STORAGE_KEY = `fs:${FS_STORAGE_VERSION}`;

export const fileCache = new StorageArea<string, string>(FS_STORAGE_KEY);

export async function loadFilesFromCache(): Promise<{ [key: string]: string }> {
  const ret: { [key: string]: string } = {};
  for await (const [fpath, value] of fileCache.entries()) {
    ret[fpath] = value;
  }
  return ret;
}

export async function saveFilesToCache(files: {
  [key: string]: string;
}): Promise<void> {
  await Promise.all(
    Object.entries(files).map(([fpath, value]) => {
      return fileCache.set(fpath, value);
    })
  );
}

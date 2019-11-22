import { fileCache } from "../storages/fileCache";
import * as mfs from "../helpers/monacoFileSystem";
import * as presets from "./presetStates";
import * as nfs from "../helpers/nativeFileSystem";
import { remote } from "../api/remote";

export type UpdateFilesAction = {
  type: "update-files";
  payload: {
    files: Array<{ filepath: string }>;
  };
};

export type UpdateDistAction = {
  type: "update-dist";
  payload: {
    code: string;
    builtAt: number;
  };
};

export type UpdatePreviewAction = {
  type: "update-preview";
  payload: {
    previewCode: string;
    builtAt: number;
  };
};

export type SelectFileAction = {
  type: "select-file";
  payload: {
    filepath: string;
  };
};

export type Action =
  | UpdateFilesAction
  | UpdateDistAction
  | UpdatePreviewAction
  | SelectFileAction;

export async function reset() {
  await fileCache.clear();
  setTimeout(() => {
    location.reload();
  }, 0);
  return {
    type: "__reset"
  };
}

export async function loadPreset(presetName: "playground" | "svelte") {
  await fileCache.clear();
  await mfs.disposeAll();
  const files = presets[presetName] || {
    "/index.tsx": "// coding!",
    "/package.json": '{"dependencies": {}}',
    "/tsconfig.json": '{"compilerOptions": {}}'
  };
  await Promise.all(
    Object.entries(files).map(async ([fname, content]) => {
      await fileCache.set(fname, content);
      mfs.writeFile(fname, content);
    })
  );
  // TODO: Uupdate correctrly
  location.reload();
  return { type: "__loadPreset" };
}

export async function loadFromNativeFS() {
  await fileCache.clear();
  await mfs.disposeAll();
  const files = await nfs.loadFromNativeFS();
  await Promise.all(
    Object.entries(files).map(async ([fname, content]) => {
      await fileCache.set(fname, content);
      mfs.writeFile(fname, content);
    })
  );
  location.reload();
  return {
    type: "__load_from_native_fs"
  };
}

export async function writeFile(filepath: string, content: string) {
  await fileCache.set(filepath, content);

  return {
    type: "__write",
    payload: { filepath, content }
  };
}

export function selectFile(filepath: string) {
  return {
    type: "select-file",
    payload: { filepath }
  };
}

export function updateFileTree() {
  const json = mfs.toJSON();
  const t = Object.keys(json);
  t.sort();
  const files = t.map(f => ({ filepath: f }));
  return {
    type: "update-files",
    payload: {
      files
    }
  };
}

export async function addFile(filepath: string) {
  mfs.writeFile(filepath, "");
  await fileCache.set(filepath, "");

  return (dispatch: Function) => {
    dispatch(updateFileTree());
    dispatch(selectFile(filepath));
  };
}

export async function deleteFile(filepath: string) {
  mfs.deleteFile(filepath);
  await fileCache.delete(filepath);

  return (dispatch: Function) => dispatch(updateFileTree());
}

export async function requestBundle(entry: string) {
  const code = await _compileOnMemory(entry, { minify: true });
  return (dispatch: Function) => {
    dispatch({
      type: "update-dist",
      payload: {
        code,
        builtAt: Date.now()
      }
    });
  };
}

export async function requestPreview(entry: string = "/__preview__/index.tsx") {
  const code = await _compileOnMemory(entry, { minify: false });
  return (dispatch: Function) => {
    dispatch({
      type: "update-preview",
      payload: {
        previewCode: code,
        builtAt: Date.now()
      }
    });
  };
}

export async function writeToNativeFs() {
  const fileMap = mfs.toJSON();
  await nfs.writeToNativeFS(fileMap);
  return {
    type: "__write_to_native_fs"
  };
}

async function _compileOnMemory(
  entry: string,
  options: { minify: boolean }
): Promise<string> {
  const pkgModel = mfs.findFile("/package.json");
  const tsconfigModel = mfs.findFile("/tsconfig.json");
  if (pkgModel && tsconfigModel) {
    const fileMap = mfs.toJSON();
    const code = await remote.compile({
      entry,
      files: fileMap,
      tsConfig: tsconfigModel.getValue(),
      minify: options.minify,
      pkg: JSON.parse(pkgModel.getValue()),
      cache: fileCache
    });
    return code;
  }
  throw new Error("Need package.json and tsconfig.json");
}

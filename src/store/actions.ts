import { fileCache } from "./../storages/fileCache";
import * as mfs from "../helpers/monacoFileSystem";

export async function reset() {
  await fileCache.clear();
  setTimeout(() => {
    location.reload();
  }, 0);
  return {
    type: "__reset"
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

const compileLoading = import("memory-compiler");
export async function requestBundle() {
  const pkgModel = mfs.findFile("/package.json");
  const tsconfigModel = mfs.findFile("/tsconfig.json");
  if (pkgModel && tsconfigModel) {
    const fileMap = mfs.toJSON();
    const { compile } = await compileLoading;
    const code = await compile({
      files: fileMap,
      tsConfig: tsconfigModel.getValue(),
      minify: true,
      pkg: JSON.parse(pkgModel.getValue()),
      cache: fileCache
    });
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
}

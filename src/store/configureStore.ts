import {
  fileCache,
  loadFilesFromCache,
  saveFilesToCache
} from "./../storages/fileCache";
import { applyMiddleware, createStore as createReduxStore } from "redux";
import thunk from "redux-thunk";
import { createFirstState } from "./presetStates";
// @ts-ignore
import promise from "redux-promise";
import * as mfs from "../helpers/monacoFileSystem";
import { State, Action, reducer, saveMiddleware } from "./index";

export async function configureStore() {
  // await fileCache.clear();
  const files = await loadFilesFromCache();
  if (Object.keys(files).length === 0) {
    console.log("initialize...");
    const initialFiles = createFirstState();
    await saveFilesToCache(initialFiles);
    mfs.restoreFromJSON(initialFiles);
  } else {
    mfs.restoreFromJSON(files);
  }
  const data = mfs.toJSON();
  const fileNames = Object.keys(data);
  const initialState: State = {
    editing: {
      filepath: "/index.ts"
    },
    files: fileNames.map(f => ({
      filepath: f
    }))
  };
  const store = createReduxStore<State, Action, {}, {}>(
    reducer as any,
    initialState,
    applyMiddleware(thunk, promise, saveMiddleware)
  );
  return store;
}

// @ts-ignore
import logger from "redux-logger";
import { loadFilesFromCache, saveFilesToCache } from "./../storages/fileCache";
import {
  applyMiddleware,
  createStore as createReduxStore,
  Action
} from "redux";
import thunk from "redux-thunk";
import { createFirstFiles } from "../reducers/presetStates";
// @ts-ignore
import promise from "redux-promise";
import * as mfs from "../helpers/monacoFileSystem";
import { State, reducer } from "../reducers";

export async function configureStore() {
  const initialState = await loadInitialState();
  const store = createReduxStore<State, Action, {}, {}>(
    reducer as any,
    initialState,
    applyMiddleware(thunk, promise, logger)
  );
  return store;
}

async function loadInitialState() {
  const files = await loadFilesFromCache();
  if (Object.keys(files).length === 0) {
    console.log("initialize...");
    const initialFiles = createFirstFiles();
    await saveFilesToCache(initialFiles);
    mfs.restoreFromJSON(initialFiles);
  } else {
    mfs.restoreFromJSON(files);
  }
  const data = mfs.toJSON();
  const fileNames = Object.keys(data);
  fileNames.sort();
  const main = fileNames.find(name => name.startsWith("/index"));
  const initialState: State = {
    dist: null,
    preview: null,
    editing: {
      filepath: main ?? "/index.tsx"
    },
    files: fileNames.map(f => ({
      filepath: f
    }))
  };
  return initialState;
}

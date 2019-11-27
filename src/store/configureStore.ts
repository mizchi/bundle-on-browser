import { workspace, PersistedWorkspace } from "./../storages/workspace";
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
// @ts-ignore
import uuid from "uuid";

export async function configureStore() {
  const id = await findWorkspaceId();
  const initialState = await loadInitialState(id);
  const store = createReduxStore<State, Action, {}, {}>(
    reducer as any,
    initialState,
    applyMiddleware(thunk, promise, logger)
  );
  return store;
}

async function findWorkspaceId(): Promise<string> {
  const storagedWorkspaceId = localStorage.getItem("workspaceId");
  if (storagedWorkspaceId) {
    return storagedWorkspaceId;
  }

  const ws: PersistedWorkspace[] = [];
  for await (const [, w] of workspace.entries()) {
    ws.push(w);
  }

  if (ws.length > 0) {
    return ws[0].workspaceId;
  }
  const workspaceId = uuid();
  localStorage.setItem("workspaceId", workspaceId);
  const initialFiles = createFirstFiles();
  await saveFilesToCache(initialFiles);
  await workspace.set(workspaceId, { workspaceId, files: initialFiles });
  return workspaceId;
}

async function loadInitialState(workspaceId: string) {
  const files = await loadFilesFromCache();
  await mfs.restoreFromJSON(files);
  // if (Object.keys(files).length === 0) {
  //   console.log("initialize...");
  //   const initialFiles = createFirstFiles();
  //   await saveFilesToCache(initialFiles);
  //   await mfs.restoreFromJSON(initialFiles);
  // } else {
  //   await mfs.restoreFromJSON(files);
  // }

  const data = mfs.toJSON();
  const fileNames = Object.keys(data);
  fileNames.sort();

  const main = fileNames.find(name => name.startsWith("/index"));

  // const workspace = 1;
  const initialState: State = {
    dist: null,
    preview: null,
    workspaces: [],
    editing: {
      workspaceId: "",
      filepath: main ?? "/index.tsx"
    },
    files: fileNames.map(f => ({
      filepath: f
    }))
  };
  return initialState;
}

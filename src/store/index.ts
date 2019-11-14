import { Store, AnyAction } from "redux";
import * as mfs from "../helpers/monacoFileSystem";
import { throttle } from "lodash-es";

export type State = {
  editing: {
    filepath: string;
  };
  files: Array<{
    filepath: string;
  }>;
};

export type Action =
  | {
      type: "update-files";
      payload: {
        files: Array<{ filepath: string }>;
      };
    }
  | {
      type: "select-file";
      payload: {
        filepath: string;
      };
    };

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "select-file": {
      return {
        ...state,
        editing: {
          filepath: action.payload.filepath
        }
      };
    }
    case "update-files": {
      return {
        ...state,
        files: action.payload.files
      };
    }
    default: {
      return state;
    }
  }
};

const save = throttle(() => {
  console.log("save!", Date.now());
}, 3000);

export const saveMiddleware: any = (store: Store<State>) => (next: any) => (
  action: AnyAction
) => {
  save();
  next(action);
};

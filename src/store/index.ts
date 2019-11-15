import { Store, AnyAction } from "redux";
import { throttle } from "lodash-es";

export type State = {
  editing: {
    filepath: string;
  };
  dist: null | {
    code: string;
    builtAt: number;
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
      type: "update-dist";
      payload: {
        code: string;
        builtAt: number;
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
    case "update-dist": {
      return {
        ...state,
        dist: {
          code: action.payload.code,
          builtAt: action.payload.builtAt
        }
      };
    }

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

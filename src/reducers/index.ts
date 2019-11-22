import { Action } from "./actions";

export type State = {
  editing: {
    filepath: string;
  };
  preview: null | {
    previewCode: string;
    builtAt: string;
  };
  dist: null | {
    code: string;
    builtAt: number;
  };
  files: Array<{
    filepath: string;
  }>;
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
    case "update-preview": {
      return {
        ...state,
        preview: {
          previewCode: action.payload.previewCode,
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

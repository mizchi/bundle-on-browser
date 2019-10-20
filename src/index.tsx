import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { App } from "./components/App";

const deps = {
  preact: "*",
  "lodash.flatten": "*"
};

const initialPkg = {
  private: true,
  dependencies: deps
};

export type State = {
  editing: {
    filename: string;
  };
  files: { [key: string]: string };
};

const initialState = {
  editing: {
    filename: "index.ts"
  },
  files: {
    "index.ts": `
import flatten from "lodash.flatten";
import { h } from 'preact';
const el = h("div", null, "Hello");
console.log(flatten([[1], 2]));
`,
    "package.json": JSON.stringify(initialPkg, null, 2)
  }
};

type Action =
  | {
      type: "update-file";
      payload: {
        filename: string;
        content: string;
      };
    }
  | {
      type: "select-file";
      payload: {
        filename: string;
      };
    };

const reducer = (state: State = initialState, action: Action) => {
  switch (action.type) {
    case "select-file": {
      return {
        ...state,
        editing: {
          filename: action.payload.filename
        }
      };
    }
    case "update-file": {
      return {
        ...state,
        files: {
          ...state.files,
          [action.payload.filename]: action.payload.content
        }
      };
    }
    default: {
      return state;
    }
  }
};

const store = createStore(reducer as any);

async function main() {
  const root = document.querySelector(".root") as HTMLDivElement;
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  );
}

main();

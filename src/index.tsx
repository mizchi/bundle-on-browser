import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, AnyAction } from "redux";
import { App } from "./components/App";
import { fromJSON, toJSON } from "./helpers/monacoFileSystem";

const deps = {
  preact: "10.*.*",
  "lodash.flatten": "*",
  react: "16.*.*"
};

const initialPkg = {
  private: true,
  dependencies: deps
};

const initialTsConfig = {
  compilerOptions: {
    target: "es2019",
    module: "esNext"
  }
};

export type State = {
  editing: {
    filepath: string;
  };
  files: Array<{
    filepath: string;
  }>;
};

const initialFS = {
  // "/index.ts": `import { foo } from './foo';\nimport React from "react";\nconsole.log(React);`,
  "/index.ts": `import { foo } from './foo';\nfoo.a();`,
  "/foo.ts": "export const foo = { a: () => console.log('xxx') }",
  "/package.json": JSON.stringify(initialPkg, null, 2),
  "/tsconfig.json": JSON.stringify(initialTsConfig, null, 2)
};

type Action =
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

const reducer = (state: State, action: Action) => {
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

async function main() {
  fromJSON(initialFS);
  const data = toJSON();
  const fileNames = Object.keys(data);
  const initialState: State = {
    editing: {
      filepath: fileNames[0]
    },
    files: fileNames.map(f => ({
      filepath: f
    }))
  };

  const store = createStore<State, AnyAction, any, any>(
    reducer as any,
    initialState
  );

  const root = document.querySelector(".root") as HTMLDivElement;

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  );
}

main();

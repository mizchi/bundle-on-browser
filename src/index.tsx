// import "normalize.css/normalize.css";
import "ress/dist/ress.min.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";

// ---

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { App } from "./components/App";
import { configureStore } from "./store/configureStore";
import { KeyBindings } from "./components/Keybindings";

async function main() {
  const root = document.querySelector(".root") as HTMLDivElement;
  const store = await configureStore();

  ReactDOM.render(
    <Provider store={store}>
      <>
        <KeyBindings />
        <App />
      </>
    </Provider>,
    root
  );
}

main();

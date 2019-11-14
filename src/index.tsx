import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { App } from "./components/App";
import { configureStore } from "./store/configureStore";

async function main() {
  const root = document.querySelector(".root") as HTMLDivElement;
  const store = await configureStore();

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  );
}

main();

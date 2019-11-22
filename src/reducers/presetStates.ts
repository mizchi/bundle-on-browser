const deps = {
  preact: "10.*.*",
  "lodash.flatten": "*",
  react: "16.*.*",
  svelte: "3.15.0"
};

const initialTsConfig = {
  compilerOptions: {
    target: "es2019",
    module: "esNext",
    jsx: "react",
    jsxFactory: "h"
  }
};

const initialPkg = {
  private: true,
  dependencies: deps
};

const sampleSvelte = `<script>
let name = 'world';
</script>
<h1>Hello {name}!</h1>
`;
const sampleVue = `<template><div>hello</div></template>`;

const previewAssets = {
  "__preview__/index.tsx": `// preview
import main from "../index";
import variables from './variables';
main({ variables, onClose() { console.log("closed") }});
`,
  "/__preview__/variables.json": JSON.stringify(
    { name: "John Doe", count: 0 },
    null,
    2
  )
};

export const vue = {
  ...previewAssets,
  "/index.tsx": `// vue sample
import Vue from "vue";
new Vue({
  render(h) {
    return <div>hello</div>
  }
}).$mount(document.body)
`,
  "/package.json": JSON.stringify({
    private: true,
    dependencies: { vue: "2.*" }
  }),
  "/tsconfig.json": JSON.stringify(
    {
      compilerOptions: {
        target: "es2019",
        module: "esNext",
        jsx: "react",
        jsxFactory: "h"
      }
    },
    null,
    2
  )
};

export const react = {
  ...previewAssets,
  "/index.tsx": `import React from "react";
import ReactDOM from "react-dom";

function Hello() {
  return <h1>Hello</h1>
}

export default (options) => {
  ReactDOM.render(<Hello />, document.body);
};
`,
  "/package.json": JSON.stringify(
    {
      private: true,
      dependencies: { react: "16.*", "react-dom": "16.*" }
    },
    null,
    2
  ),
  "/tsconfig.json": JSON.stringify(
    {
      compilerOptions: {
        target: "es2019",
        module: "esNext",
        jsx: "react"
      }
    },
    null,
    2
  )
};

export const preact = {
  ...previewAssets,
  "/index.tsx": `import { render, h } from "preact";
import { useState, useCallback } from "preact/hooks";

function Counter() {
  const [state, setState] = useState(0);
  const onClick = useCallback(() => {
    setState(state + 1)
  }, [state]);
  return <button onClick={onClick}>{state}++</button>
}
export default (options) => {
  render(<Counter />, document.body);
}
`,
  "/package.json": JSON.stringify({
    private: true,
    dependencies: { preact: "10.*" }
  }),
  "/tsconfig.json": JSON.stringify(initialTsConfig, null, 2)
};

export const svelte = {
  ...previewAssets,
  "/index.tsx": `import App from "./app.svelte";\nnew App({target: document.body})`,
  "/app.svelte": sampleSvelte,
  "/package.json": JSON.stringify({
    private: true,
    dependencies: { svelte: "3.15.*" }
  }),
  "/tsconfig.json": JSON.stringify(initialTsConfig, null, 2)
};

export const playground = {
  ...previewAssets,
  "/index.tsx": `import flatten from 'lodash.flatten';
import {render, h} from 'preact';
import {foo} from './foo';
import Bar from './bar.svelte';
export default () => {
  new Bar({target: document.body});
  const el = document.createElement('div');
  el.style.position = "absolute";
  el.style.right = "10px";
  el.style.bottom = "10px";
  el.style.width = "200px";
  el.style.height = "100px";
  el.style.backgroundColor = "wheat";
  document.body.appendChild(el);
  render(<div style={{padding: 10}}>{foo.a}</div>, el);
}
`,
  "/bar.svelte": sampleSvelte,
  "/foo.ts": "export const foo = { a: 'text from foo.a' }",
  "/my-component.vue": sampleVue,
  "/package.json": JSON.stringify(initialPkg, null, 2),
  "/tsconfig.json": JSON.stringify(initialTsConfig, null, 2)
};

export function createFirstFiles() {
  return playground;
}

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

export const vue = {
  "/pre.ts": `// TODO: Strip process.env by preprocess
  window.process = {env: {NODE_ENV: "production"}};
  `,
  "/index.tsx": `import "./pre";
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
  "/pre.ts": `// TODO: Strip process.env by preprocess
window.process = {env: {NODE_ENV: "production"}};
`,
  "/index.tsx": `import "./pre";
import React from "react";
import ReactDOM from "react-dom";

function Hello() {
  return <h1>Hello</h1>
}
ReactDOM.render(<Hello />, document.body);
`,
  "/package.json": JSON.stringify({
    private: true,
    dependencies: { react: "16.*", "react-dom": "16.*" }
  }),
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
  "/index.tsx": `import { render, h } from "preact";
import { useState, useCallback } from "preact/hooks";

function Counter() {
  const [state, setState] = useState(0);
  const onClick = useCallback(() => {
    setState(state + 1)
  }, [state]);
  return <button onClick={onClick}>{state}++</button>
}

render(<Counter />, document.body);
`,
  "/package.json": JSON.stringify({
    private: true,
    dependencies: { preact: "10.*" }
  }),
  "/tsconfig.json": JSON.stringify(initialTsConfig, null, 2)
};

export const svelte = {
  "/index.tsx": `import App from "./app.svelte";\nnew App({target: document.body})`,
  "/app.svelte": sampleSvelte,
  "/package.json": JSON.stringify({
    private: true,
    dependencies: { svelte: "3.15.*" }
  }),
  "/tsconfig.json": JSON.stringify(initialTsConfig, null, 2)
};

export const playground = {
  "/index.tsx": `import flatten from 'lodash.flatten';
import {render, h} from 'preact';
import {foo} from './foo';
import Bar from './bar.svelte';

new Bar({target: document.body})

const el = document.createElement('div');
el.style.position = "absolute";
el.style.right = "10px";
el.style.bottom = "10px";
el.style.width = "200px";
el.style.height = "100px";
el.style.backgroundColor = "wheat";
document.body.appendChild(el);

render(<div style={{padding: 10}}>{foo.a}</div>, el);
<div>hello</div>
`,
  "/bar.svelte": sampleSvelte,
  "/foo.ts": "export const foo = { a: 'text from foo.a' }",
  "/my-component.vue": sampleVue,
  "/package.json": JSON.stringify(initialPkg, null, 2),
  "/tsconfig.json": JSON.stringify(initialTsConfig, null, 2)
};

export function createFirstState() {
  return playground;
}

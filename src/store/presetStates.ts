export function createFirstState() {
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

  const initialFS = {
    // "/index.ts": `import { foo } from './foo';\nimport React from "react";\nconsole.log(React);`,
    "/index.ts": `import flatten from 'lodash.flatten';
import {render, h} from 'preact';
import {foo} from './foo';

const el = document.createElement('div');
el.style.position = "absolute";
el.style.right = "10px";
el.style.bottom = "10px";
el.style.width = "200px";
el.style.height = "100px";
el.style.backgroundColor = "wheat";
document.body.appendChild(el);

render(h("div", {style: {padding: 10}}, foo.a), el);
`,
    "/foo.ts": "export const foo = { a: 'text from foo.a' }",

    "/package.json": JSON.stringify(initialPkg, null, 2),
    "/tsconfig.json": JSON.stringify(initialTsConfig, null, 2)
  };
  return initialFS;
}

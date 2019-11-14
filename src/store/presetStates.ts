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

render(h("div", {style: {padding: 10}}, foo.a), document.body);
`,
    "/foo.ts": "export const foo = { a: 'text from foo.a' }",
    "/package.json": JSON.stringify(initialPkg, null, 2),
    "/tsconfig.json": JSON.stringify(initialTsConfig, null, 2)
  };
  return initialFS;
}

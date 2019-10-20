import { rollup } from "rollup";
import commonjs from "rollup-plugin-commonjs";
import urlResolve from "rollup-plugin-url-resolve";
import virtual from "./packages/memory-compiler/plugins/virtual";
import ses from "ses";
import resolve from "version-resolver";

const pkg = {
  dependencies: {
    preact: "10.0.1"
  }
};

const code = `
import { h } from 'https://cdn.jsdelivr.net/npm/preact@10.0.1/dist/preact.js';
const el = h("div", null, "Hello");
console.log(el);
`;

async function main() {
  const versions = await resolve(pkg.dependencies);
  console.log("versions", versions);

  const bundle = await rollup({
    input: "index.js",
    plugins: [
      virtual({
        "index.js": code
      }),
      urlResolve(),
      commonjs({
        include: /^https:\/\/cdn\.jsdelivr\.net/
      })
    ]
  });

  const result = await bundle.generate({
    format: "umd"
  });

  // console.log("result", result.output[0].code);
  const out = result.output[0].code;
  console.log(out);
  // evaluateOnSandbox(out);
}

function evaluateOnSandbox(code: string) {
  const s = ses.makeSESRootRealm();
  s.evaluate(code, { console: console });
}

main();

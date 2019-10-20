import { rollup } from "rollup";
import commonjs from "rollup-plugin-commonjs";
import urlResolve from "rollup-plugin-url-resolve";
import virtual from "./plugins/virtual";
import mymod from "./plugins/mymod";

export async function compile(pkg: { dependencies: any }, code: string) {
  const bundle = await rollup({
    input: "index.js",
    plugins: [
      virtual({
        "index.js": code
      }),
      mymod({ dependencies: pkg.dependencies }),
      // @ts-ignore
      urlResolve(),
      commonjs({
        include: /^https:\/\/cdn\.jsdelivr\.net/
      })
    ]
  });

  const result = await bundle.generate({
    format: "umd"
  });

  const out = result.output[0];
  return out;
}

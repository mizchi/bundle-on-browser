import { rollup } from "rollup";
import commonjs from "rollup-plugin-commonjs";
import urlResolve from "./plugins/url-resolve";
import virtual from "./plugins/virtual";
import rewriteToCdn from "./plugins/rewrite-to-cdn";

export async function compile(
  pkg: { dependencies: any },
  code: string
): Promise<string> {
  const bundle = await rollup({
    input: "index.js",
    plugins: [
      virtual({
        "index.js": code
      }),
      rewriteToCdn({ dependencies: pkg.dependencies }),
      urlResolve() as any,
      commonjs({
        include: /^https:\/\/cdn\.jsdelivr\.net/
      })
    ]
  });
  const result = await bundle.generate({
    format: "iife"
  });
  const out = result.output[0];
  return out.code;
}

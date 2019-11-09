import { rollup } from "rollup";
import commonjs from "rollup-plugin-commonjs";
// @ts-ignore
import virtual from "rollup-plugin-virtual";
import terser from "terser";
import { transpileModule, ModuleKind, ScriptTarget } from "typescript";
import cdnResolver from "rollup-plugin-cdn-resolver";

export async function compile(
  code: string,
  options: {
    pkg: { dependencies: any };
    minify?: boolean;
    typescript?: boolean;
  }
): Promise<string> {
  const jsIndex = transpileModule(code, {
    compilerOptions: { module: ModuleKind.ES2015, target: ScriptTarget.ES5 }
  });
  const bundle = await rollup({
    input: "index.js",
    plugins: [
      virtual({
        "index.js": jsIndex.outputText
      }),
      cdnResolver({ pkg: options.pkg }) as any,
      // rewriteToCdn({ dependencies: options.pkg.dependencies }),
      // urlResolve() as any,
      commonjs({
        include: /^https:\/\/cdn\.jsdelivr\.net/
      })
    ]
  });

  const result = await bundle.generate({
    name: "_1",
    format: "esm"
  });

  const out = result.output[0].code as string;
  // return out.code;
  if (options.minify) {
    const minfied = terser.minify(out);
    return minfied.code as string;
  } else {
    return out;
  }
}

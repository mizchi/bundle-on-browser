// import { compile } from 'memory-compiler';
import { rollup } from "rollup";
import cdnResolver, { CDNCache } from "rollup-plugin-cdn-resolver";
import commonjs from "rollup-plugin-commonjs";
import terser from "terser";
import { parseConfigFileTextToJson, transpileModule } from "typescript";
import memfs from "./plugins/memfs";
import replace from "rollup-plugin-replace";
// @ts-ignore
// import svelte from "rollup-plugin-svelte";
import { compile as compileSvelte } from "svelte/compiler";

// @ts-ignore
import * as compiler from "../../external/vue-next@compiler-dom.esm-browser.prod";

export async function compile(options: {
  files: { [filepath: string]: string };
  pkg: { dependencies: any };
  tsConfig: any;
  minify?: boolean;
  typescript?: boolean;
  cache?: CDNCache;
}): Promise<string> {
  const parsedTsConfig = parseConfigFileTextToJson(
    "/tsconfig.json",
    options.tsConfig
  );
  const bundle = await rollup({
    input: "/index",
    plugins: [
      memfs(options.files, {
        transform(filename: string, value: string) {
          if (filename.endsWith(".svelte")) {
            const data = compileSvelte(value);
            // TODO: Include css
            return data.js.code;
          } else if (filename.endsWith(".vue")) {
            // WIP
            const { code } = compiler.compile(value, {
              filename
            });
            return `export default new Function(\`${code}\`)`;
          } else if (filename.endsWith(".ts") || filename.endsWith(".tsx")) {
            const out = transpileModule(value, parsedTsConfig.config);
            return out.outputText;
          } else {
            return value;
          }
        }
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production")
      }),
      cdnResolver({ pkg: options.pkg, cache: options.cache }) as any,
      commonjs({
        include: /^https:\/\/cdn\.jsdelivr\.net/
      })
      // VuePlugin()
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

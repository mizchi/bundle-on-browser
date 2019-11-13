import { rollup } from "rollup";
import cdnResolver from "rollup-plugin-cdn-resolver";
import commonjs from "rollup-plugin-commonjs";
import terser from "terser";
import { parseConfigFileTextToJson, transpileModule } from "typescript";
import memfs from "./plugins/memfs";

export async function compile(options: {
  files: { [filepath: string]: string };
  pkg: { dependencies: any };
  tsConfig: any;
  minify?: boolean;
  typescript?: boolean;
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
          if (filename.endsWith(".ts") || filename.endsWith(".tsx")) {
            const out = transpileModule(value, parsedTsConfig.config);
            return out.outputText;
          } else {
            return value;
          }
        }
      }),
      cdnResolver({ pkg: options.pkg }) as any,
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

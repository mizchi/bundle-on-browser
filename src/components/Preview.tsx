import React, { useCallback, useState } from "react";
import resolvePkgVersions from "version-resolver";
import { cache } from "version-resolver/Registry";
import { useSelector } from "react-redux";
import { State } from "../index";
import * as rollup from "rollup";
import terser from "terser";
import commonjs from "rollup-plugin-commonjs";
// @ts-ignore
import urlResolve from "rollup-plugin-url-resolve";
import { transpileModule, ModuleKind, ScriptTarget } from "typescript";
// @ts-ignore
import virtual from "rollup-plugin-virtual";
// @ts-ignore
import ses from "ses";

export function Preview() {
  const text = useSelector((s: State) => s.files["package.json"]);
  const index = useSelector((s: State) => s.files["index.ts"]);

  const [resolved, setResolved] = useState<any | null>(null);
  const [output, setOutput] = useState<any | null>(null);

  const onClickResolve = useCallback(async () => {
    const pkg = JSON.parse(text);
    const results = await resolvePkgVersions(pkg.dependencies);
    Object.entries(results.appDependencies)
      .slice(0, 3)
      .map(async ([key, val]: [string, any]) => {
        // const tarballUrl = cache[key].versions[val.version].dist.tarball;
        console.log(
          key,
          val.version,
          cache[key].versions[val.version].dist.tarball
        );
        // const res = await fetch(tarballUrl);
        // const rawTarball = await res.text();
        // console.log(key, rawTarball);
      });
    setResolved(results);
  }, [text]);

  const onClickBundle = useCallback(async () => {
    const code = await compile(index, { filename: "index.ts", minify: true });
    // evaluateOnSandbox(code);
    setOutput(code);
  }, [index]);

  return (
    <div style={{ overflow: "auto", height: "100vh" }}>
      <div>
        <button onClick={onClickBundle}>Bundle</button>
        {output && (
          <div>
            <button
              onClick={() => {
                evaluateOnSandbox(output);
              }}
            >
              Run
            </button>
            <pre>
              <code>{output}</code>
            </pre>
          </div>
        )}
        <hr />
        <button onClick={onClickResolve}>Resolve version</button>
        {resolved && (
          <pre>
            <code>{JSON.stringify(resolved, null, 2)}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

function evaluateOnSandbox(code: string) {
  const s = ses.makeSESRootRealm();
  console.log(code);
  s.evaluate(code, { console: console });
}

async function compile(
  code: string,
  options: {
    filename: string;
    minify?: boolean;
    typescript?: boolean;
  }
): Promise<string> {
  const jsIndex = transpileModule(code, {
    compilerOptions: { module: ModuleKind.ES2015, target: ScriptTarget.ES5 }
  });

  const bundle = await rollup.rollup({
    input: "index.js",
    plugins: [
      virtual({
        "index.js": jsIndex.outputText
      }),
      urlResolve(),
      commonjs({
        include: /^https:\/\/cdn\.jsdelivr\.net/
      })
    ]
  });

  const { output } = await bundle.generate({ format: "iife" });
  const out = output[0].code;
  if (options.minify) {
    const minfied = terser.minify(out);
    return minfied.code as string;
  } else {
    return out;
  }
}

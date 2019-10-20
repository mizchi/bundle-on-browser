import React, { useCallback, useState } from "react";
import resolvePkgVersions from "version-resolver";
import { cache } from "version-resolver/Registry";
import { useSelector } from "react-redux";
import { State } from "../index";
import terser from "terser";
// @ts-ignore
// import ses from "ses";
import { compile } from "memory-compiler";
import { transpileModule, ModuleKind, ScriptTarget } from "typescript";

export function Preview() {
  const pkgText = useSelector((s: State) => s.files["package.json"]);
  const indexText = useSelector((s: State) => s.files["index.ts"]);

  const [resolved, setResolved] = useState<any | null>(null);
  const [output, setOutput] = useState<any | null>(null);

  const onClickResolve = useCallback(async () => {
    const pkg = JSON.parse(pkgText);
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
  }, [pkgText]);

  const onClickBundle = useCallback(async () => {
    const code = await compileWithInput(indexText, {
      filename: "index.ts",
      minify: true,
      pkgText
    });
    // evaluateOnSandbox(code);
    setOutput(code);
  }, [indexText, pkgText]);

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
  eval(code);
  // const s = ses.makeSESRootRealm();
  // console.log(code);
  // s.evaluate(code, { console: console, Symbol });
}

async function compileWithInput(
  code: string,
  options: {
    pkgText?: string;
    filename: string;
    minify?: boolean;
    typescript?: boolean;
  }
): Promise<string> {
  const jsIndex = transpileModule(code, {
    compilerOptions: { module: ModuleKind.ES2015, target: ScriptTarget.ES5 }
  });
  const pkg = JSON.parse(options.pkgText || "{}");
  const out = await compile(pkg, jsIndex.outputText);
  // return out;

  if (options.minify) {
    const minfied = terser.minify(out);
    return minfied.code as string;
  } else {
    return out;
  }
}

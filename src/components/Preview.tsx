import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { State } from "../index";
import terser from "terser";
import { compile } from "memory-compiler";
import { transpileModule, ModuleKind, ScriptTarget } from "typescript";

export function Preview() {
  const pkgText = useSelector((s: State) => s.files["package.json"]);
  const indexText = useSelector((s: State) => s.files["index.ts"]);
  const [output, setOutput] = useState<any | null>(null);
  const onClickBundle = useCallback(async () => {
    const code = await compileWithInput(indexText, {
      minify: true,
      pkgText
    });
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
      </div>
    </div>
  );
}

function evaluateOnSandbox(code: string) {
  eval(code);
}

async function compileWithInput(
  code: string,
  options: {
    pkgText?: string;
    // filename: string;
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

// @ts-ignore
// import ses from "ses";
// const s = ses.makeSESRootRealm();
// console.log(code);
// s.evaluate(code, { console: console, Symbol });

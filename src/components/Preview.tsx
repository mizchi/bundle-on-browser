import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { State } from "../index";
import { compile } from "memory-compiler";

export function Preview() {
  const pkgText = useSelector((s: State) => s.files["package.json"]);
  const indexText = useSelector((s: State) => s.files["index.ts"]);
  const [output, setOutput] = useState<any | null>(null);
  const onClickBundle = useCallback(async () => {
    const code = await compile(indexText, {
      minify: true,
      pkg: JSON.parse(pkgText)
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
              <code>
                {Array.from(output).length}: {output}
              </code>
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

// @ts-ignore
// import ses from "ses";
// const s = ses.makeSESRootRealm();
// console.log(code);
// s.evaluate(code, { console: console, Symbol });

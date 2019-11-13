import React, { useCallback, useState } from "react";
import { compile } from "memory-compiler";
import * as mfs from "../helpers/monacoFileSystem";

export function Preview() {
  const [output, setOutput] = useState<any | null>(null);

  const onClickBundle = useCallback(async () => {
    const pkgModel = mfs.findFile("/package.json");
    const tsconfigModel = mfs.findFile("/tsconfig.json");
    if (pkgModel && tsconfigModel) {
      const fileMap = mfs.toJSON();
      const code = await compile({
        files: fileMap,
        // tsConfig: JSON.parse(tsconfigModel.getValue()),
        tsConfig: tsconfigModel.getValue(),

        // minify: true,
        pkg: JSON.parse(pkgModel.getValue())
      });
      setOutput(code);
    }
  }, []);
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

import React, { useCallback, useState, useRef } from "react";
import { compile } from "memory-compiler";
import * as mfs from "../helpers/monacoFileSystem";

export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const [building, setBuilding] = useState<boolean>(false);
  const [output, setOutput] = useState<any | null>(null);
  const onClickBundle = useCallback(async () => {
    setBuilding(true);
    try {
      const pkgModel = mfs.findFile("/package.json");
      const tsconfigModel = mfs.findFile("/tsconfig.json");
      if (pkgModel && tsconfigModel) {
        const fileMap = mfs.toJSON();
        const code = await compile({
          files: fileMap,
          tsConfig: tsconfigModel.getValue(),
          minify: true,
          pkg: JSON.parse(pkgModel.getValue())
        });
        setOutput(code);
        const iframe = createIframe(code);
        if (ref.current) {
          if (ref.current.firstChild) {
            ref.current.firstChild.remove();
          }
          ref.current.append(iframe);
        }
      }
      setBuilding(false);
    } catch (err) {
      setBuilding(false);
    }
  }, [ref, building]);
  return (
    <div style={{ overflow: "auto", height: "100vh", width: "100%" }}>
      <div>
        <button onClick={onClickBundle} disabled={building}>
          Bundle &amp; Run
        </button>
        {output && (
          <div>
            <code>Size: {kb(Array.from(output).length)}kb</code>
          </div>
        )}
        <div ref={ref} />
      </div>
    </div>
  );
}

function kb(size: number) {
  const k = size / 1024;
  return Math.floor(k * 1000) / 1000;
}

function createIframe(code: string) {
  const iframe = document.createElement("iframe");
  iframe.style.boxSizing = "border-box";
  iframe.style.width = "100%";
  iframe.style.minHeight = "400px";
  iframe.style.border = "none";
  iframe.style.backgroundColor = "wheat";

  iframe.scrolling = "no";
  // @ts-ignore
  iframe.frameborder = "no";

  const html = `<html><head><style>html,body{margin:0;padding: 0      setBuilding(false);
  }</style></head><body><script>${code}</script></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  iframe.src = URL.createObjectURL(blob);
  return iframe;
}

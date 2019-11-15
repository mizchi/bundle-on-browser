import React, { useCallback, useState, useRef } from "react";
import { compile } from "memory-compiler";
import * as mfs from "../helpers/monacoFileSystem";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";

export function Tools() {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const { dist } = useSelector((s: State) => {
    return {
      dist: s.dist
    };
  });

  const [building, setBuilding] = useState<boolean>(false);
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
        dispatch({
          type: "update-dist",
          payload: {
            code,
            builtAt: Date.now()
          }
        });
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
        {dist?.code && (
          <div>
            <code>Size: {kb(Array.from(dist.code).length)}kb</code>
          </div>
        )}
      </div>
    </div>
  );
}

function kb(size: number) {
  const k = size / 1024;
  return Math.floor(k * 1000) / 1000;
}

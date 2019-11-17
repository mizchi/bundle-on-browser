import React, { useCallback, useState, useRef } from "react";
// import { compile } from "memory-compiler";
import * as mfs from "../helpers/monacoFileSystem";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { requestBundle } from "../store/actions";

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
    const a = await requestBundle();
    dispatch(a);
    setBuilding(false);
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

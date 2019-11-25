import React, { useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../reducers";
import { requestBundle, requestPreview } from "../../reducers/actions";
import { Button } from "@blueprintjs/core";

export function Tools() {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const { dist } = useSelector((s: State) => {
    return {
      dist: s.dist
    };
  });
  const [building, setBuilding] = useState<boolean>(false);
  const onClickBundle = useCallback(() => {
    (async () => {
      setBuilding(true);
      try {
        const a = await requestBundle("/index");
        dispatch(a);
      } finally {
        setBuilding(false);
      }
    })();
  }, [ref, building]);

  const onClickPreview = useCallback(() => {
    (async () => {
      setBuilding(true);
      try {
        const a = await requestPreview("/__preview__/index.tsx");
        dispatch(a);
      } finally {
        setBuilding(false);
      }
    })();
  }, [ref, building]);

  const hash = dist?.code ? toHash(dist.code) : null;

  return (
    <div style={{ overflow: "auto", height: "100%", width: "100%" }}>
      <div>
        <Button
          text="Preview"
          icon="build"
          onClick={onClickPreview}
          disabled={building}
        />

        <Button
          text="Build"
          icon="build"
          onClick={onClickBundle}
          disabled={building}
        />
        {dist?.code && (
          <div>
            <code>Size: {kb(Array.from(dist.code).length)}kb</code>
          </div>
        )}
        {hash && (
          <div>
            <a
              download={`${hash}.js`}
              onClick={ev => {
                if (hash && dist?.code) {
                  const url = URL.createObjectURL(
                    new Blob([dist?.code], { type: "text/javascript" })
                  );
                  // @ts-ignore
                  ev.target.href = url;
                }
              }}
            >
              {hash}.js
            </a>
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

function toHash(code: string) {
  const crypto = require("crypto");
  const shasum = crypto.createHash("sha1");
  shasum.update(code); // ここの引数にハッシュを計算したい文字列を渡す
  return shasum.digest("hex");
}

import React, { useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../reducers";
import { requestBundle, requestPreview } from "../reducers/actions";
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
      const a = await requestBundle("/index");
      dispatch(a);
      setBuilding(false);
    })();
  }, [ref, building]);

  const onClickPreview = useCallback(() => {
    (async () => {
      setBuilding(true);
      const a = await requestPreview("/__preview__/index.tsx");
      dispatch(a);
      setBuilding(false);
    })();
  }, [ref, building]);

  return (
    <div style={{ overflow: "auto", height: "100vh", width: "100%" }}>
      <div>
        <Button
          text="Build(/index)"
          icon="build"
          onClick={onClickBundle}
          disabled={building}
        />
        {dist?.code && (
          <div>
            <code>Size: {kb(Array.from(dist.code).length)}kb</code>
          </div>
        )}
        <hr />
        <Button
          text="Preview(/__preview__/index.tsx)"
          icon="build"
          onClick={onClickPreview}
          disabled={building}
        />
      </div>
    </div>
  );
}

function kb(size: number) {
  const k = size / 1024;
  return Math.floor(k * 1000) / 1000;
}

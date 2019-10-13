import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "..";

export function Filer() {
  const { files, currentFilename } = useSelector((s: State) => {
    return { files: Object.keys(s.files), currentFilename: s.editing.filename };
  });
  const dispatch = useDispatch();
  return (
    <ul>
      {files.map(f => {
        return (
          <li
            style={{
              textDecoration: f === currentFilename ? "underline" : "none"
            }}
            key={f}
            onClick={() => {
              dispatch({ type: "select-file", payload: { filename: f } });
            }}
          >
            {f}
          </li>
        );
      })}
    </ul>
  );
}

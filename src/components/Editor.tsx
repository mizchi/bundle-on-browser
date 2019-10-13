import React from "react";
import MonacoEditor from "./MonacoEditor";
import { useSelector, useDispatch } from "react-redux";
import { State } from "../index";
import path from "path";

const extToLang: { [key: string]: "json" | "javascript" | "typescript" } = {
  ".js": "javascript",
  ".ts": "typescript",
  ".json": "json"
};

export function Editor() {
  const dispatch = useDispatch();
  // const text = useSelector((s: State) => s.files[filename]);
  const { currentFilename, currentContent } = useSelector((s: State) => {
    return {
      currentFilename: s.editing.filename,
      currentContent: s.files[s.editing.filename]
    };
  });

  const extname = path.extname(currentFilename);
  const lang = extToLang[extname as any];

  return (
    <div style={{ width: "50vw" }}>
      <MonacoEditor
        language={lang}
        key={currentFilename}
        value={currentContent}
        onChangeValue={value => {
          dispatch({
            type: "update-file",
            payload: {
              filename: currentFilename,
              content: value
            }
          });
        }}
        width="calc(100vw / 2)"
      />
    </div>
  );
}

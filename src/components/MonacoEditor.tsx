import React, { useEffect, useState, useRef } from "react";
import * as mfs from "../helpers/monacoFileSystem";
import { buildEditor } from "../helpers/buildEditor";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { Fill } from "react-unite";

export default function MonacoEditor() {
  return (
    <Fill>
      {(width, height) => {
        return <_MonacoEditor width={width} height={height} />;
      }}
    </Fill>
  );
}

function _MonacoEditor(props: { width: any; height: any }) {
  const dispatch = useDispatch();
  const { currentFilepath } = useSelector((s: State) => {
    return {
      files: s.files,
      currentFilepath: s.editing.filepath
    };
  });

  const editorRef = useRef(null as any);
  useEffect(() => {
    if (editorRef.current) {
      const editor = buildEditor(editorRef.current, dispatch);
      editor.layout({ width: props.width, height: props.height });
      editor.focus();
      const model =
        mfs.findFile(currentFilepath) || mfs.writeFile(currentFilepath, "");
      editor.setModel(model);
    }
  }, [currentFilepath, props.width, props.height]);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div ref={editorRef}></div>
    </div>
  );
}

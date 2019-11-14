import * as monaco from "monaco-editor";
import React, { useEffect, useState, useRef } from "react";
import { ResizeDetector } from "./ResizeDetector";
import * as mfs from "../helpers/monacoFileSystem";
import { buildEditor } from "../helpers/buildEditor";
import { useDispatch } from "react-redux";

export default (props: {
  filepath: string;
  width: string;
  onChangeValue: (filename: string, value: string) => void;
}) => {
  const dispatch = useDispatch();
  const [currentFilepath, setCurrentFilepath] = useState<string | null>(null);
  const [
    currentEditor,
    setCurrentEditor
  ] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorRef = useRef(null as any);

  useEffect(() => {
    if (editorRef.current) {
      const editor = buildEditor(editorRef.current, dispatch);
      setCurrentEditor(editor);
      editor.layout();
      editor.focus();
      // file changed
      if (currentFilepath !== props.filepath && editor) {
        setCurrentFilepath(props.filepath);
        const model =
          mfs.findFile(props.filepath) || mfs.writeFile(props.filepath, "");
        editor.setModel(model);
        const disposer = editor.onDidChangeModelContent(_event => {
          props.onChangeValue(props.filepath, editor.getValue());
        });
        return () => disposer.dispose();
        // outer value changed
      }
    }
  }, [props.filepath]);

  return (
    <ResizeDetector
      style={{
        width: props.width,
        maxWidth: "960px",
        height: "100vh",
        overflow: "none"
      }}
      onResize={rect => {
        currentEditor &&
          currentEditor.layout({
            width: rect.width as any,
            height: rect.height as any
          });
      }}
    >
      <div ref={editorRef} />
    </ResizeDetector>
  );
};

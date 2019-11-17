import React, { useEffect, useState, useRef } from "react";
import * as mfs from "../helpers/monacoFileSystem";
import * as monaco from "monaco-editor";
import * as actions from "../store/actions";
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

function _MonacoEditor(props: {
  width: number | string;
  height: number | string;
}) {
  const dispatch = useDispatch();
  const [
    currentEditor,
    setCurrentEditor
  ] = useState<null | monaco.editor.IStandaloneCodeEditor>(null);

  const { currentFilepath } = useSelector((s: State) => {
    return {
      files: s.files,
      currentFilepath: s.editing.filepath
    };
  });

  const editorRef = useRef(null as any);
  useEffect(() => {
    if (editorRef.current) {
      const editor = monaco.editor.create(editorRef.current, options);
      editor.onDidChangeModelContent(_changes => {
        if (editor) {
          const value = editor.getValue();
          const fpath = editor.getModel()?.uri.path;
          if (fpath) {
            dispatch(actions.writeFile(fpath, value));
          }
        }
      });
      setCurrentEditor(editor);
      return () => {
        editor.dispose();
      };
    }

    return () => {};
  }, []);
  useEffect(() => {
    if (currentEditor && editorRef.current) {
      // const editor = currentEditor(editorRef.current, dispatch);
      currentEditor.layout({ width: props.width, height: props.height } as any);
      currentEditor.focus();
      const model =
        mfs.findFile(currentFilepath) || mfs.writeFile(currentFilepath, "");
      currentEditor.setModel(model);
    }
  }, [currentEditor, currentFilepath, props.width, props.height]);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }}
    >
      <div ref={editorRef}></div>
    </div>
  );
}

const options: monaco.editor.IEditorConstructionOptions = {
  model: null,
  theme: "vs-dark",
  scrollbar: {
    arrowSize: 11
  },
  fontSize: 16,
  wordWrap: "on",
  wordWrapMinified: true,
  minimap: {
    enabled: false
  },
  lineNumbers: "off"
};

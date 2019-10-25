import * as monaco from "monaco-editor";
import React, { useEffect } from "react";
import { useLayoutEffect, useState, useRef } from "react";
import { ResizeDetector } from "./ResizeDetector";

// @ts-ignore
globalThis.MonacoEnvironment = {
  getWorkerUrl: function(_moduleId: string, label: string) {
    if (label === "json") {
      return "./json.worker.bundle.js";
    }
    if (label === "css") {
      return "./css.worker.bundle.js";
    }
    if (label === "html") {
      return "./html.worker.bundle.js";
    }
    if (label === "typescript" || label === "javascript") {
      return "./ts.worker.bundle.js";
    }
    return "./editor.worker.bundle.js";
  }
};

export default (props: {
  value: string;
  width: string;
  language: "json" | "javascript" | "typescript";
  onChangeValue: (value: string) => void;
}) => {
  const [
    editor,
    setEditor
  ] = useState<null | monaco.editor.IStandaloneCodeEditor>(null);

  const [initialValue, setInitialValue] = useState(props.value);
  useLayoutEffect(() => {
    if (initialValue !== props.value) {
      setInitialValue(props.value);
      if (editor && editor.getValue() !== props.value) {
        editor.setValue(props.value);
      }
    }
  }, [props.value]);

  const editorRef = useRef(null as any);

  useEffect(() => {
    if (editorRef.current) {
      const newEditor = monaco.editor.create(editorRef.current, {
        value: props.value,
        language: props.language,
        theme: "vs-dark",
        scrollbar: {
          arrowSize: 11
        },
        fontSize: 16,
        // useTabStops: true,
        wordWrap: "on",
        wordWrapMinified: true,
        // wrappingIndent: "indent",
        minimap: {
          enabled: false
        },
        lineNumbers: "off"
      });
      newEditor.onDidChangeModelContent(event => {
        const value = newEditor.getValue();
        props.onChangeValue(value);
      });
      newEditor.layout();
      newEditor.focus();
      setEditor(newEditor);
      return () => {
        newEditor.dispose();
      };
    }
  }, []);

  return (
    <ResizeDetector
      style={{
        width: props.width,
        maxWidth: "960px",
        height: "100vh",
        overflow: "none"
      }}
      onResize={rect => {
        editor &&
          editor.layout({
            width: rect.width as any,
            height: rect.height as any
          });
      }}
    >
      <div ref={editorRef} />
    </ResizeDetector>
  );
};

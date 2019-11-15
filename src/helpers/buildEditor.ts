import * as monaco from "monaco-editor";
import * as actions from "../store/actions";

let _lastEditor: monaco.editor.IStandaloneCodeEditor | null = null;
// let _lastEditor: monaco.editor.IStandaloneCodeEditor | null = null;

export function buildEditor(el: HTMLElement, dispatch: Function) {
  if (_lastEditor && _lastEditor.getDomNode() !== el) {
    console.log("dom changed", el);
    _lastEditor.dispose();
    _lastEditor.getDomNode()?.remove();
  }
  const editor = monaco.editor.create(el, {
    // automaticLayout: true,
    model: null,
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
  // debugger;

  editor.onDidChangeModelContent(_changes => {
    if (editor) {
      const value = editor.getValue();
      const fpath = editor.getModel()?.uri.path;
      if (fpath) {
        dispatch(actions.writeFile(fpath, value));
        // fileCache.set(fpath, value);
      }
    }
  });
  editor.onDidChangeModel(() => {
    editor.focus();
  });
  // editor.layout();
  _lastEditor = editor;
  return editor;
}

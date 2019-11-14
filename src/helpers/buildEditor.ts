import * as monaco from "monaco-editor";
import * as actions from "../store/actions";

let _editor: monaco.editor.IStandaloneCodeEditor | null = null;
export function buildEditor(el: HTMLElement, dispatch: Function) {
  if (_editor) return _editor;
  _editor = monaco.editor.create(el, {
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

  _editor.onDidChangeModelContent(_changes => {
    if (_editor) {
      const value = _editor.getValue();
      const fpath = _editor.getModel()?.uri.path;
      if (fpath) {
        dispatch(actions.writeFile(fpath, value));
        // fileCache.set(fpath, value);
      }
    }
  });
  _editor.onDidChangeModel(() => {
    _editor?.focus();
  });
  return _editor;
}

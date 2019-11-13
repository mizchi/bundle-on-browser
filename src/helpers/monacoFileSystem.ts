import * as monaco from "monaco-editor";

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

monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
// monaco.languages.typescript.typescriptDefaults.addExtraLib(
//   "declare class Xxx {  } ",
//   "/foo.ts"
// );

// const fileStates = new Map<string, monaco.editor.IModel>();
import path from "path";

const extToLang: { [key: string]: "json" | "javascript" | "typescript" } = {
  ".js": "javascript",
  ".ts": "typescript",
  ".json": "json"
};

let _editor: monaco.editor.IStandaloneCodeEditor | null = null;
export function buildEditor(el: HTMLElement) {
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
  _editor.onDidChangeModel(() => {
    _editor?.focus();
  });
  return _editor;
}

export function findFile(filepath: string): monaco.editor.IModel | void {
  return monaco.editor.getModels().find(model => {
    return model.uri.path === filepath;
  });
}

export function renameFile(
  filepath: string,
  to: string
): monaco.editor.IModel | void {
  const m = findFile(filepath);
  if (m) {
    const value = m.getValue();
    deleteFile(filepath);
    writeFile(to, value);
  }
}

export function updateFile(filepath: string, content: string) {
  const m = monaco.editor.getModels().find(m => m.uri.path === filepath);
  if (m) {
    m.setValue(content);
  }
  return m;
}

export function deleteFile(filepath: string) {
  const confirmed = window.confirm(`Delete ${filepath}`);
  if (!confirmed) {
    return;
  }
  const m = monaco.editor.getModels().find(m => m.uri.path === filepath);
  if (m) {
    // m.uri = "/Trashe/" + Math.random();
    m.dispose();
    // debugger;
    console.log("disposed", filepath);
  } else {
    console.warn(`[mfs:deleteFile] ${filepath} does not exists`);
  }
}

export function writeFile(
  filepath: string,
  content?: string
): monaco.editor.ITextModel {
  const extname = path.extname(filepath);
  const lang = extToLang[extname as any];
  // console.log(filepath, lang);
  // debugger;
  const newModel = monaco.editor.createModel(
    content || "",
    lang,
    monaco.Uri.from({
      scheme: "file",
      path: filepath
    })
  );
  return newModel;
}

export type SerializedFS = { [k: string]: string };

export function toJSON(): SerializedFS {
  const ret: { [k: string]: string } = {};
  for (const m of monaco.editor.getModels()) {
    const v = m.getValue();
    const fpath = m.uri.path;
    ret[fpath] = v;
  }
  return ret;
}

export function fromJSON(serialized: SerializedFS): void {
  Object.entries(serialized).map(([k, v]) => {
    writeFile(k, v);
  });
}

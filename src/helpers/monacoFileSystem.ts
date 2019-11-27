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

// monaco.languages.typescript.
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
import path from "path";
import { parseConfigFileTextToJson } from "typescript";

const extToLang: {
  [key: string]: "json" | "javascript" | "typescript" | "html";
} = {
  ".js": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".json": "json",
  ".svelte": "html",
  ".vue": "html"
};

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
    m.dispose();
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
  console.log(extname, lang);
  if (lang === undefined) {
    debugger;
  }
  const newModel = monaco.editor.createModel(
    content || "",
    lang,
    monaco.Uri.from({
      scheme: "file",
      path: filepath
    })
  );
  newModel.updateOptions({
    tabSize: 2,
    insertSpaces: true
  });
  if (filepath === "/tsconfig.json" && content) {
    const conf = parseConfigFileTextToJson(filepath, content);
    // debugger;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
      conf.config.compilerOptions
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      "declare module '*';",
      "decls.d.ts"
    );
  }
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

export function restoreFromJSON(serialized: SerializedFS): void {
  Object.entries(serialized).map(([k, v]) => {
    writeFile(k, v);
  });
}

export function disposeAll(): void {
  for (const m of monaco.editor.getModels()) {
    m.dispose();
  }
}

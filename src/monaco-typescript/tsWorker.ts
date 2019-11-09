import * as ts from "typescript";
import { lib_dts, lib_es6_dts } from "./lib/lib";
import * as monaco from "monaco-editor";

export interface IExtraLib {
  content: string;
  version: number;
}

export interface IExtraLibs {
  [path: string]: IExtraLib;
}

import IWorkerContext = monaco.worker.IWorkerContext;

const DEFAULT_LIB = {
  NAME: "defaultLib:lib.d.ts",
  CONTENTS: lib_dts + ";\ndeclare module 'react' {};"
};

const ES6_LIB = {
  NAME: "defaultLib:lib.es6.d.ts",
  CONTENTS: lib_es6_dts + ";\ndeclare module 'react' {};"
};

export class TypeScriptWorker implements ts.LanguageServiceHost {
  // --- model sync -----------------------

  private _ctx: IWorkerContext;
  private _extraLibs: IExtraLibs = Object.create(null);
  private _languageService = ts.createLanguageService(this);
  private _compilerOptions: ts.CompilerOptions;

  constructor(ctx: IWorkerContext, createData: ICreateData) {
    this._ctx = ctx;
    this._compilerOptions = createData.compilerOptions;
    this._extraLibs = createData.extraLibs;
  }

  // --- language service host ---------------

  getCompilationSettings(): ts.CompilerOptions {
    return this._compilerOptions;
  }

  getScriptFileNames(): string[] {
    let models = this._ctx.getMirrorModels().map(model => model.uri.toString());
    return models.concat(Object.keys(this._extraLibs));
  }

  private _getModel(fileName: string): monaco.worker.IMirrorModel | null {
    let models = this._ctx.getMirrorModels();
    for (let i = 0; i < models.length; i++) {
      if (models[i].uri.toString() === fileName) {
        return models[i];
      }
    }
    return null;
  }

  getScriptVersion(fileName: string): string {
    let model = this._getModel(fileName);
    if (model) {
      return model.version.toString();
    } else if (this.isDefaultLibFileName(fileName)) {
      // default lib is static
      return "1";
    } else if (fileName in this._extraLibs) {
      return String(this._extraLibs[fileName].version);
    } else {
      throw new Error("get script version");
    }
  }

  getScriptSnapshot(fileName: string): ts.IScriptSnapshot {
    let text: string;
    let model = this._getModel(fileName);
    if (model) {
      // a true editor model
      text = model.getValue();
    } else if (fileName in this._extraLibs) {
      // extra lib
      text = this._extraLibs[fileName].content;
    } else if (fileName === DEFAULT_LIB.NAME) {
      text = DEFAULT_LIB.CONTENTS;
    } else if (fileName === ES6_LIB.NAME) {
      text = ES6_LIB.CONTENTS;
    } else {
      // @ts-ignore
      return;
    }

    return <ts.IScriptSnapshot>{
      getText: (start, end) => text.substring(start, end),
      getLength: () => text.length,
      getChangeRange: () => undefined
    };
  }

  getScriptKind?(fileName: string): ts.ScriptKind {
    const suffix = fileName.substr(fileName.lastIndexOf(".") + 1);
    switch (suffix) {
      case "ts":
        return ts.ScriptKind.TS;
      case "tsx":
        return ts.ScriptKind.TSX;
      case "js":
        return ts.ScriptKind.JS;
      case "jsx":
        return ts.ScriptKind.JSX;
      default:
        return this.getCompilationSettings().allowJs
          ? ts.ScriptKind.JS
          : ts.ScriptKind.TS;
    }
  }

  getCurrentDirectory(): string {
    return "";
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    // TODO@joh support lib.es7.d.ts
    return (options.target as ts.ScriptTarget) <= ts.ScriptTarget.ES5
      ? DEFAULT_LIB.NAME
      : ES6_LIB.NAME;
  }

  isDefaultLibFileName(fileName: string): boolean {
    return fileName === this.getDefaultLibFileName(this._compilerOptions);
  }

  // --- language features

  private static clearFiles(diagnostics: ts.Diagnostic[]) {
    // Clear the `file` field, which cannot be JSON'yfied because it
    // contains cyclic data structures.
    diagnostics.forEach(diag => {
      diag.file = undefined;
      const related = <ts.Diagnostic[]>diag.relatedInformation;
      if (related) {
        related.forEach(diag2 => (diag2.file = undefined));
      }
    });
  }

  async getSyntacticDiagnostics(fileName: string): Promise<ts.Diagnostic[]> {
    const diagnostics = this._languageService.getSyntacticDiagnostics(fileName);
    TypeScriptWorker.clearFiles(diagnostics);
    return diagnostics;
  }

  async getSemanticDiagnostics(fileName: string): Promise<ts.Diagnostic[]> {
    const diagnostics = this._languageService.getSemanticDiagnostics(fileName);
    TypeScriptWorker.clearFiles(diagnostics);
    return diagnostics;
  }

  async getSuggestionDiagnostics(
    fileName: string
  ): Promise<ts.DiagnosticWithLocation[]> {
    const diagnostics = this._languageService.getSuggestionDiagnostics(
      fileName
    );
    TypeScriptWorker.clearFiles(diagnostics);
    return diagnostics;
  }

  getCompilerOptionsDiagnostics(fileName: string): Promise<ts.Diagnostic[]> {
    const diagnostics = this._languageService.getCompilerOptionsDiagnostics();
    TypeScriptWorker.clearFiles(diagnostics);
    return Promise.resolve(diagnostics);
  }

  async getCompletionsAtPosition(
    fileName: string,
    position: number
  ): Promise<ts.WithMetadata<ts.CompletionInfo>> {
    return this._languageService.getCompletionsAtPosition(
      fileName,
      position,
      undefined
    ) as ts.WithMetadata<ts.CompletionInfo>;
  }

  async getCompletionEntryDetails(
    fileName: string,
    position: number,
    entry: string
  ): Promise<ts.CompletionEntryDetails> {
    return this._languageService.getCompletionEntryDetails(
      fileName,
      position,
      entry,
      undefined,
      undefined,
      undefined
    ) as ts.CompletionEntryDetails;
  }

  async getSignatureHelpItems(
    fileName: string,
    position: number
  ): Promise<ts.SignatureHelpItems> {
    // @ts-ignore
    return this._languageService.getSignatureHelpItems(
      fileName,
      position,
      undefined
    );
  }

  async getQuickInfoAtPosition(
    fileName: string,
    position: number
  ): Promise<ts.QuickInfo> {
    return this._languageService.getQuickInfoAtPosition(
      fileName,
      position
    ) as ts.QuickInfo;
  }

  async getOccurrencesAtPosition(
    fileName: string,
    position: number
  ): Promise<ReadonlyArray<ts.ReferenceEntry>> {
    return this._languageService.getOccurrencesAtPosition(
      fileName,
      position
    ) as ts.ReferenceEntry[];
  }

  async getDefinitionAtPosition(
    fileName: string,
    position: number
  ): Promise<ReadonlyArray<ts.DefinitionInfo>> {
    return this._languageService.getDefinitionAtPosition(
      fileName,
      position
    ) as ts.DefinitionInfo[];
  }

  async getReferencesAtPosition(
    fileName: string,
    position: number
  ): Promise<ts.ReferenceEntry[]> {
    return this._languageService.getReferencesAtPosition(
      fileName,
      position
    ) as ts.ReferenceEntry[];
  }

  async getNavigationBarItems(
    fileName: string
  ): Promise<ts.NavigationBarItem[]> {
    return this._languageService.getNavigationBarItems(fileName);
  }

  getFormattingEditsForDocument(
    fileName: string,
    options: ts.FormatCodeOptions
  ): Promise<ts.TextChange[]> {
    return Promise.resolve(
      this._languageService.getFormattingEditsForDocument(fileName, options)
    );
  }

  getFormattingEditsForRange(
    fileName: string,
    start: number,
    end: number,
    options: ts.FormatCodeOptions
  ): Promise<ts.TextChange[]> {
    return Promise.resolve(
      this._languageService.getFormattingEditsForRange(
        fileName,
        start,
        end,
        options
      )
    );
  }

  getFormattingEditsAfterKeystroke(
    fileName: string,
    postion: number,
    ch: string,
    options: ts.FormatCodeOptions
  ): Promise<ts.TextChange[]> {
    return Promise.resolve(
      this._languageService.getFormattingEditsAfterKeystroke(
        fileName,
        postion,
        ch,
        options
      )
    );
  }

  findRenameLocations(
    fileName: string,
    positon: number,
    findInStrings: boolean,
    findInComments: boolean,
    providePrefixAndSuffixTextForRename: boolean
  ): Promise<readonly ts.RenameLocation[]> {
    return this._languageService.findRenameLocations(
      fileName,
      positon,
      findInStrings,
      findInComments,
      providePrefixAndSuffixTextForRename
    ) as any;
  }

  async getRenameInfo(
    fileName: string,
    positon: number,
    options: ts.RenameInfoOptions
  ): Promise<ts.RenameInfo> {
    return this._languageService.getRenameInfo(fileName, positon, options);
  }

  async getEmitOutput(fileName: string): Promise<ts.EmitOutput> {
    return this._languageService.getEmitOutput(fileName);
  }

  async getCodeFixesAtPosition(
    fileName: string,
    start: number,
    end: number,
    errorCodes: number[],
    formatOptions: ts.FormatCodeOptions
  ): Promise<ReadonlyArray<ts.CodeFixAction>> {
    const preferences = {};
    return this._languageService.getCodeFixesAtPosition(
      fileName,
      start,
      end,
      errorCodes,
      formatOptions,
      preferences
    );
  }

  updateExtraLibs(extraLibs: IExtraLibs) {
    this._extraLibs = extraLibs;
  }
}

export interface ICreateData {
  compilerOptions: ts.CompilerOptions;
  extraLibs: IExtraLibs;
}

export function create(
  ctx: IWorkerContext,
  createData: ICreateData
): TypeScriptWorker {
  return new TypeScriptWorker(ctx, createData);
}

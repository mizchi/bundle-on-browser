// @ts-ignore
import * as worker from "monaco-editor-core/esm/vs/editor/editor.worker";
import { TypeScriptWorker, ICreateData } from "./tsWorker";

self.onmessage = () => {
  // ignore the first message
  worker.initialize((ctx: worker.IWorkerContext, createData: ICreateData) => {
    return new TypeScriptWorker(ctx, createData);
  });
};

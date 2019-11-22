import { CompileOptions } from "./../../packages/memory-compiler/index";
import { wrap } from "comlink";

const worker = new Worker(
  /* webpackChunkName: "compiler" */
  "../workers/compilerWorker.ts",
  { type: "module" }
);

export const remote: {
  compile(options: CompileOptions): Promise<string>;
  format(code: string): Promise<string>;
} = wrap(worker) as any;

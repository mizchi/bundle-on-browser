import { fileCache } from "./../storages/fileCache";
import { expose } from "comlink";
const compileLoading = import("memory-compiler");

async function compile(args: {
  files: { [filepath: string]: string };
  pkg: { dependencies: any };
  tsConfig: any;
  minify?: boolean;
  typescript?: boolean;
}) {
  const compiler = await compileLoading;
  return await compiler.compile({ ...args, cache: fileCache });
}

expose({
  compile
});

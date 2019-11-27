import { npmCache } from "./../storages/npmCache";
import { expose } from "comlink";
// import * as compiler from "memory-compiler";
// @ts-ignore
import * as compiler from "@mizchi/web-compiler";
// @ts-ignore
import prettier from "prettier/standalone";
// @ts-ignore
import parserTypeScript from "prettier/parser-typescript";

async function compile(args: {
  entry: string;
  files: { [filepath: string]: string };
  pkg: { dependencies: any };
  tsConfig: any;
  minify?: boolean;
  typescript?: boolean;
}) {
  return compiler.compile({ ...args, cache: npmCache });
}

async function format(code: string) {
  // @ts-ignore
  return prettier.format(code, {
    parser: "typescript",
    plugins: [parserTypeScript]
  });
}

expose({
  compile,
  format
});

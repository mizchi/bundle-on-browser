import { transform } from "@babel/core";

import relativeRewrite from "./plugins/relativeRewrite";

export default function rewriteRelativeJavaScriptImports(
  base: URL,
  code: string
) {
  const options = {
    // Ignore .babelrc and package.json babel config
    // because we haven't installed dependencies so
    // we can't load plugins; see #84
    babelrc: false,
    // Make a reasonable attempt to preserve whitespace
    // from the original file. This ensures minified
    // .mjs stays minified; see #149
    retainLines: true,
    plugins: [relativeRewrite(base)]
  };
  // @ts-ignore
  return transform(code, options).code;
}

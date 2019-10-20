import rewriteRelativeJavaScriptImports from "./rewriteRelativeJavaScriptImports";

export default function rewriteRelativeImports(
  base: URL,
  contentType: string,
  code: string
) {
  switch (contentType) {
    case "application/javascript":
      return rewriteRelativeJavaScriptImports(base, code);
    default:
      return code;
  }
}

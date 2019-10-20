function isRelativeURL(value: string) {
  return value.charAt(0) === "." || value.charAt(0) === "/";
}

function rewriteValue(node: any, base: URL) {
  if (isRelativeURL(node.value)) {
    const absoluteURL = new URL(node.value, base);
    node.value = absoluteURL.href;
  }
}

export default function relativeRewrite(base: URL) {
  return {
    manipulateOptions(_opts: any, parserOpts: any) {
      parserOpts.plugins.push(
        "dynamicImport",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "importMeta"
      );
    },

    visitor: {
      CallExpression(path: any) {
        if (path.node.callee.type !== "Import") {
          // Some other function call, not import();
          return;
        }

        if (path.node.arguments[0].type !== "StringLiteral") {
          // Non-string argument, probably a variable or expression, e.g.
          // import(moduleId)
          // import('./' + moduleName)
          return;
        }

        rewriteValue(path.node.arguments[0], base);
      },
      ExportAllDeclaration(path: any) {
        rewriteValue(path.node.source, base);
      },
      ExportNamedDeclaration(path: any) {
        if (!path.node.source) {
          // This export has no "source", so it's probably
          // a local variable or function, e.g.
          // export { varName }
          // export const constName = ...
          // export function funcName() {}
          return;
        }

        rewriteValue(path.node.source, base);
      },
      ImportDeclaration(path: any) {
        rewriteValue(path.node.source, base);
      }
    }
  };
}

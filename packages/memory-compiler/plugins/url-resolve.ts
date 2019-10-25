import readData from "data-uri-to-buffer";
import fetch from "isomorphic-unfetch";
import { transform } from "@babel/core";
import path from "path";
import { Plugin } from "rollup";

export default function urlResolve() {
  return {
    name: "url-resolve",
    resolveId(source: string, importer: string) {
      console.log("[resolveId]", source, importer);
      if (
        !source.includes("commonjsHelpers.js") &&
        importer.startsWith("http")
      ) {
        const dir = path.dirname(importer);
        const result = path.join(dir, source);
        console.log(dir, source, result);
        // debugger;
        return result;
      }
      const url = parseURL(source);
      return url ? resolveURL(url) : null;
    },
    load(id: string) {
      // return null as any;
      console.log("[load]", id);
      const url = parseURL(id);
      return url ? loadURL(url) : null;
    }
  } as Plugin;
}

function rewriteRelativeImports(base: URL, contentType: string, code: string) {
  switch (contentType) {
    case "application/javascript": {
      const options = {
        babelrc: false,
        // retainLines: true,
        plugins: [relativeRewrite(base)]
      };
      // @ts-ignore
      return transform(code, options).code;
    }
    default:
      return code;
  }
}

function parseURL(source: string) {
  try {
    return new URL(source);
  } catch (error) {
    // Not a valid absolute-URL-with-fragment string
    // https://url.spec.whatwg.org/#absolute-url-with-fragment-string
    return null;
  }
}

function resolveURL(url: URL) {
  switch (url.protocol) {
    case "data:":
    // case "file:":
    case "http:":
    case "https:":
      return url.href;
    default:
      throw new Error(`Cannot resolve URL protocol: ${url.protocol}`);
  }
}

async function loadURL(url: URL) {
  // console.log('load', url.href);

  switch (url.protocol) {
    case "data:": {
      // TODO: Resolve relative imports in data URIs?
      return readData(url.href);
      // case "file:":
      //   return rewriteRelativeImports(
      //     url,
      //     mimeTypes.lookup(url.href),
      //     readFile(url).toString()
      //   );
    }
    case "http:":
    case "https:": {
      return fetch(url.href).then(res =>
        res.status === 404
          ? null
          : res.text().then(text => {
              // Resolve relative to the final URL, i.e. how browsers do it.
              const finalURL = new URL(res.url);
              const contentTypeHeader = res.headers.get("Content-Type");
              const contentType = contentTypeHeader
                ? contentTypeHeader.split(";")[0]
                : "text/plain";

              return rewriteRelativeImports(finalURL, contentType, text);
            })
      );
    }
    default: {
      throw new Error(`Cannot load URL protocol: ${url.protocol}`);
    }
  }
}

// --- babel plugin

function _isRelativeURL(value: string) {
  return value.charAt(0) === "." || value.charAt(0) === "/";
}

function _rewriteValue(node: any, base: URL) {
  if (_isRelativeURL(node.value)) {
    const absoluteURL = new URL(node.value, base);
    node.value = absoluteURL.href;
  }
}

function relativeRewrite(base: URL) {
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
      CallExpression(path_: any) {
        if (path_.node.callee.type !== "Import") {
          // Some other function call, not import();
          return;
        }

        if (path_.node.arguments[0].type !== "StringLiteral") {
          // Non-string argument, probably a variable or expression, e.g.
          // import(moduleId)
          // import('./' + moduleName)
          return;
        }

        _rewriteValue(path_.node.arguments[0], base);
      },
      ExportAllDeclaration(path_: any) {
        _rewriteValue(path_.node.source, base);
      },
      ExportNamedDeclaration(path_: any) {
        if (!path_.node.source) {
          // This export has no "source", so it's probably
          // a local variable or function, e.g.
          // export { varName }
          // export const constName = ...
          // export function funcName() {}
          return;
        }
        _rewriteValue(path_.node.source, base);
      },
      ImportDeclaration(path_: any) {
        _rewriteValue(path_.node.source, base);
      }
    }
  };
}

// --- babel
export const rewriteToCdnPlugin = (versions: any) => ({
  manipulateOptions(_opts: any, parserOpts: any) {
    parserOpts.plugins.push(
      "dynamicImport",
      "exportDefaultFrom",
      "exportNamespaceFrom",
      "importMeta"
    );
  },

  visitor: {
    ImportDeclaration(path_: any) {
      const pkgName = path_.node.source.value as string;
      if (pkgName.startsWith("http") || pkgName.startsWith(".")) {
        return;
      }
      const realPkg = versions.appDependencies[pkgName];
      const version = realPkg.version;
      const mainPath = realPkg.module || realPkg.main || "index.js";
      const cdnPath = path_.join(
        `https://cdn.jsdelivr.net/npm/${pkgName}@${version}`,
        mainPath
      );
      path_.node.source.value = cdnPath;
    }
  }
});

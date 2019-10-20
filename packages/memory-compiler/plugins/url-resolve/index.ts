import readData from "data-uri-to-buffer";
// import fetch from "make-fetch-happen";
import fetch from "isomorphic-unfetch";

import rewriteRelativeImports from "./rewriteRelativeImports";

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

async function loadURL(url: URL, fetchOpts: any) {
  // console.log('load', url.href);

  switch (url.protocol) {
    case "data:":
      // TODO: Resolve relative imports in data URIs?
      return readData(url.href);
    // case "file:":
    //   return rewriteRelativeImports(
    //     url,
    //     mimeTypes.lookup(url.href),
    //     readFile(url).toString()
    //   );
    case "http:":
    case "https:":
      return fetch(url.href, fetchOpts).then(res =>
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
    default:
      throw new Error(`Cannot load URL protocol: ${url.protocol}`);
  }
}

export default function urlResolve(fetchOpts = {}) {
  return {
    resolveId(source: string) {
      const url = parseURL(source);
      return url ? resolveURL(url) : null;
    },
    load(id: string) {
      const url = parseURL(id);
      return url ? loadURL(url, fetchOpts) : null;
    }
  };
}

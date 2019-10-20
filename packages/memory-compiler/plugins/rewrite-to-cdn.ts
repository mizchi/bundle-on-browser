import resolve from "version-resolver";
import path from "path";

let resolvedVersions: any = null;
const pattern = /import\s(.*?)\sfrom\s['"]([@\w\d\-_\/\.]+)['"]/;

export default function rewriteToCdn(options: { dependencies: any }) {
  return {
    name: "rewrite-to-cdn",
    async transform(code: string, _id: string) {
      resolvedVersions =
        resolvedVersions || (await resolve(options.dependencies));
      let match;
      while ((match = pattern.exec(code))) {
        const [full, ex, pkgName] = match;
        const realPkg = resolvedVersions.appDependencies[pkgName];
        const version = realPkg.version;
        const mainPath = realPkg.main || "index.js";
        const cdnPath = path.join(
          `https://cdn.jsdelivr.net/npm/${pkgName}@${version}`,
          mainPath
        );
        code = code.replace(full, `import ${ex} from "${cdnPath}"`);
      }
      return { code };
    }
  };
}

import path from "path";

const PREFIX = `\0virtual:`;

export default function virtual(modules: any) {
  const resolvedIds = new Map();

  Object.keys(modules).forEach(id => {
    resolvedIds.set(path.resolve(id), modules[id]);
  });

  return {
    name: "virtual",

    resolveId(id: string, importer: any) {
      if (id in modules) return PREFIX + id;

      if (importer) {
        if (importer.startsWith(PREFIX))
          importer = importer.slice(PREFIX.length);
        const resolved = path.resolve(path.dirname(importer), id);
        if (resolvedIds.has(resolved)) return PREFIX + resolved;
      }
    },

    load(id: string) {
      if (id.startsWith(PREFIX)) {
        id = id.slice(PREFIX.length);

        return id in modules ? modules[id] : resolvedIds.get(id);
      }
    }
  };
}

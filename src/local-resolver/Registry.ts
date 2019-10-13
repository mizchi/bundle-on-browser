import npa from "./npa";

export class Registry {
  registryUrl: string;
  cache: { [key: string]: any };

  constructor(options: { registryUrl?: string } = {}) {
    this.registryUrl = options.registryUrl || "https://registry.npmjs.org";
    this.cache = {};
  }

  public async fetch(name: string) {
    const escapedName = name && npa(name).escapedName;
    if (this.cache[name]) {
      return this.cache[name];
    } else {
      const res = await fetch(`${this.registryUrl}/${escapedName}`);
      this.cache[name] = await res.json();
      return res;
    }
  }

  public async batchFetch(keys: string[]) {
    return Promise.all(
      keys.map(key => {
        return this.fetch(key);
      })
    );
  }
}

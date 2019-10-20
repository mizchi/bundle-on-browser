import npa from "./npa";
import fetch from "isomorphic-unfetch";

export const cache: { [key: string]: any } = {};

export class Registry {
  registryUrl: string;

  constructor(options: { registryUrl?: string } = {}) {
    this.registryUrl = options.registryUrl || "https://registry.npmjs.org";
  }

  public async fetch(name: string) {
    const escapedName = name && npa(name).escapedName;
    if (cache[name]) {
      return cache[name];
    } else {
      const res = await fetch(`${this.registryUrl}/${escapedName}`);
      cache[name] = await res.json();
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

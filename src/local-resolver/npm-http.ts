import npa from "./npa";
// @ts-ignore
import request from "superagent";
import async from "async";

export default class NpmHttpRegistry {
  registryUrl: string;
  cache: any;
  fetching: Array<any>;
  constructor(options: { registryUrl?: string } = {}) {
    this.registryUrl = options.registryUrl || "https://registry.npmjs.org";
    this.cache = {};
    this.fetching = [];
  }

  fetch(name: string, cb: Function) {
    const escapedName = name && npa(name).escapedName;

    if (this.cache[name]) {
      cb(false, this.cache[name]);
    } else {
      // console.log('Miss:', name)
      request
        .get(`${this.registryUrl}/${escapedName}`)
        .end((err: null | any, res: any) => {
          if (err || res.statusCode < 200 || res.statusCode >= 400) {
            const message = res
              ? `Status: ${res.statusCode}`
              : `Error: ${err.message}`;

            console.log(`Could not load ${name}`);
            console.log(message);

            return cb(true);
          }

          this.cache[name] = res.body;

          cb(false, this.cache[name]);
        });
    }
  }

  batchFetch(keys: string[], cb: Function) {
    const fetchKeys = keys.filter(
      key =>
        !this.cache.hasOwnProperty(key) && this.fetching.indexOf(key) === -1
    );

    if (fetchKeys.length) {
      this.fetching = this.fetching.concat(fetchKeys);
      // @ts-ignore
      async.parallel(
        fetchKeys.map((key: string) => {
          const escapedName = key && npa(key).escapedName;

          return (done: any) =>
            request
              .get(`${this.registryUrl}/${escapedName}`)
              // @ts-ignore
              .end((err, res) => {
                // if(this.cache.hasOwnProperty(key)) console.log('Double Fetch:', key)

                if (err || res.statusCode < 200 || res.statusCode >= 400) {
                  const message = res
                    ? `Status: ${res.statusCode}`
                    : `Error: ${err.message}`;

                  return done();
                }

                this.cache[key] = res.body;

                done();
              });
        }),
        cb
      );
    } else {
      cb();
    }
  }
}

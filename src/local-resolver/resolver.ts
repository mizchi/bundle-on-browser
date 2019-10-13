import NpmHttpRegistry from "./npm-http";
import async from "async";
import semver from "semver";
import { Graph } from "graphlib";

const packageJsonProps = [
  "main",
  "browser",
  "module",
  "types",
  "typings",
  "js:next",
  "unpkg"
];

export default function resolve(dependencies: { [key: string]: string }) {
  const resolver = new Resolver();
  return new Promise((resolve, reject) => {
    const depNames = Object.keys(dependencies);

    if (depNames.length === 0) {
      return resolve(resolver.jpack);
    }

    depNames.forEach(name =>
      resolver.queue.push({
        name,
        version: dependencies[name],
        parentNode: "root"
      })
    );

    resolver.queue.drain(() => {
      if (resolver.error) {
        return reject(resolver.error);
      }

      if (resolver.validatePeers) {
        resolver.validatePeerDependencies();
      }

      if (resolver.error) {
        return reject(resolver.error);
      } else {
        resolver.renderJpack();

        return resolve(resolver.jpack);
      }
    });

    resolver.startTime = Date.now();
    resolver.registry.batchFetch(depNames).then(resolver.queue.resume);
  });
}

type Task = {
  name: string;
  version: string;
  parentNode: string;
};

class Resolver {
  graph: any;
  invalidPeers: any;
  missingPeers: any;
  requestedPeers: any;
  jpack: any;
  error: any;
  queue: any;
  startTime: any;
  timeout: any;
  concurrency: any;
  registry: any;
  validatePeers: any;

  constructor() {
    this.validatePeers = true;
    this.registry = new NpmHttpRegistry({
      registryUrl: "https://registry.npmjs.cf/"
    });

    this.concurrency = 4;
    this.graph = new Graph();
    this.invalidPeers = {};
    this.missingPeers = {};
    this.requestedPeers = {};
    this.jpack = {
      appDependencies: {},
      resDependencies: {},
      warnings: {}
    };
    this.error = null;
    this.queue = async.queue(async (task: any, done: Function) => {
      if (Date.now() - this.startTime > this.timeout || this.error) {
        if (!this.error) {
          this.error = { error: "TIMEOUT" };
        }
        return done();
      }
      await this.loadRegistryPackage(task, done);
    }, this.concurrency);

    this.queue.pause();
  }

  async loadRegistryPackage(task: Task, done?: Function) {
    const name = task.name;

    // @ts-ignore
    try {
      const registryPackage = await this.registry.fetch(name);
      await this.resolveDependencies(task, registryPackage, done);
    } catch {
      this.error = {
        error: "PACKAGE_NOT_FOUND",
        data: { name }
      };
      return done && done();
    }
  }

  // Resolution & Iteration
  async resolveDependencies(task: Task, registryPackage: any, done?: Function) {
    const version = resolveVersion(task.version, registryPackage);
    // @ts-ignore
    if (!version || version.error) {
      this.error = version;
      return done && done();
    }

    const fullName = `${registryPackage.name}@${version}`;
    const versionPackageJson = registryPackage.versions[version as string];
    const isRootDependency = task.parentNode === "root";
    const subDepsResolved = this.graph.hasNode(fullName);

    if (isRootDependency) {
      this.graph.setNode(registryPackage.name, { version, fullName });
      this.graph.setNode(fullName);
      this.graph.setEdge(task.parentNode, registryPackage.name);
    } else {
      this.graph.setEdge(task.parentNode, fullName);
    }

    if (subDepsResolved) {
      return done && done();
    }

    const dependencies = Object.assign(
      {},
      versionPackageJson.dependencies,
      isRootDependency ? {} : versionPackageJson.peerDependencies
    );

    if (
      isRootDependency &&
      versionPackageJson.hasOwnProperty("peerDependencies") &&
      Object.keys(versionPackageJson.peerDependencies).length
    ) {
      this.requestedPeers[fullName] = Object.assign(
        {},
        versionPackageJson.peerDependencies
      );
      Object.keys(versionPackageJson.peerDependencies).forEach(peerName =>
        this.graph.setEdge(fullName, peerName)
      );
    }

    const depNames = Object.keys(dependencies);

    this.registry.batchFetch(depNames).then(() => {
      depNames.forEach(name =>
        this.queue.push({
          name,
          version: dependencies[name],
          parentNode: fullName
        })
      );
      done && done();
    });
  }

  validatePeerDependencies() {
    const topDeps = this.graph.successors("root");

    Object.keys(this.requestedPeers).forEach(fullName => {
      const peers = this.requestedPeers[fullName];

      Object.keys(peers).forEach(peerName => {
        const requestedPeerVersion = peers[peerName];

        if (!topDeps.some((name: string) => name === peerName)) {
          if (!this.missingPeers[peerName]) {
            this.missingPeers[peerName] = {};
          }

          this.missingPeers[peerName][fullName] = requestedPeerVersion;
        } else if (
          !semver.satisfies(
            this.graph.node(peerName).version,
            requestedPeerVersion
          )
        ) {
          if (!this.invalidPeers[fullName]) {
            this.invalidPeers[fullName] = {};
          }

          this.invalidPeers[fullName][peerName] = requestedPeerVersion;
        }
      });
    });

    if (Object.keys(this.missingPeers).length) {
      this.error = {
        error: "MISSING_PEERS",
        data: this.missingPeers
      };
    }
  }

  fillJpackDep(fullName: string, versionPkg: string | null, dep: any) {
    this.graph.successors(fullName).forEach((name: string) => {
      if (name.substr(1).indexOf("@") === -1) {
        // dependency is a peer
        const peerDep = this.graph.node(name);

        if (peerDep) {
          dep.dependencies[name] = `${name}@${peerDep.version}`;
        }
      } else {
        dep.dependencies[name.substr(0, name.lastIndexOf("@"))] = name;
        this.addJpackResDep(name);
      }
    });

    if (versionPkg) {
      packageJsonProps.forEach((prop: string) => {
        if (versionPkg.hasOwnProperty(prop)) {
          dep[prop] = versionPkg[prop as any];
        }
      });
    }
  }

  addJpackResDep(fullName: string) {
    if (!this.jpack.resDependencies.hasOwnProperty(fullName)) {
      // TODO: encode this information in nodes instead of using string ops
      const atIndex = fullName.lastIndexOf("@");

      if (atIndex <= 0) {
        // No '@' in string, or only '@' is first character (dependency is a peer)
        this.fillJpackDep(fullName, null, this.jpack.appDependencies[fullName]);
      } else {
        const depName = fullName.substr(0, atIndex);
        const version = fullName.substr(atIndex + 1);
        const versionPkg = this.registry.cache[depName].versions[version];
        const resDep = (this.jpack.resDependencies[fullName] = {
          dependencies: {}
        });

        this.fillJpackDep(fullName, versionPkg, resDep);
      }
    }
  }

  renderJpack() {
    this.graph.successors("root").forEach((depName: string) => {
      const { version, fullName } = this.graph.node(depName);
      const versionPkg = this.registry.cache[depName].versions[version];
      const appDep = (this.jpack.appDependencies[depName] = {
        version,
        dependencies: {}
      });

      this.fillJpackDep(fullName, versionPkg, appDep);
    });

    if (Object.keys(this.invalidPeers).length) {
      this.jpack.warnings.invalidPeers = this.invalidPeers;
    }
  }
}

function resolveVersion(
  requestedVersion: string,
  registryPackage: {
    "dist-tags": { [key: string]: any };
    versions: any;
    name: string;
  }
):
  | string
  | {
      error: "UNSATISFIED_RANGE";
      data: {
        name: string;
        range: any;
      };
    } {
  if (
    registryPackage["dist-tags"] &&
    registryPackage["dist-tags"].hasOwnProperty(requestedVersion)
  ) {
    return registryPackage["dist-tags"][requestedVersion];
  }

  const availableVersions = Object.keys(registryPackage.versions || {});

  if (requestedVersion === "") {
    requestedVersion = "*";
  }

  let version = semver.maxSatisfying(availableVersions, requestedVersion, true);

  if (
    !version &&
    requestedVersion === "*" &&
    availableVersions.every(
      // @ts-ignore
      availableVersion => !!semver(availableVersion, true).prerelease.length
    )
  ) {
    version =
      registryPackage["dist-tags"] && registryPackage["dist-tags"].latest;
  }

  if (!version) {
    return {
      error: "UNSATISFIED_RANGE",
      data: { name: registryPackage.name, range: requestedVersion }
    };
  } else {
    return version;
  }
}

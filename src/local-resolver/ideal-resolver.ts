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

export default class Resolver {
  graph: any;
  invalidPeers: any;
  missingPeers: any;
  requestedPeers: any;
  jpack: any;
  error: any;
  concurrency: any;
  registry: any;
  packageJsonProps: any;
  validatePeers: any;

  constructor() {
    this.validatePeers = true;
    this.registry = new NpmHttpRegistry();
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
  }

  async loadRegistryPackage(task: any) {
    const name = task.name;
    try {
      const registryPackage = await this.registry.fetch(name);
      await this.resolveDependencies(task, registryPackage);
    } catch {
      this.error = {
        error: "PACKAGE_NOT_FOUND",
        data: { name }
      };
    }
  }

  // Resolution & Iteration
  async resolveDependencies(task: any, registryPackage: any) {
    const version = this.resolveVersion(task.version, registryPackage);
    if (!version) {
      return Promise.reject("No version");
    }

    const fullName = `${registryPackage.name}@${version}`;
    const versionPackageJson = registryPackage.versions[version];
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
      return;
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
    await this.registry.batchFetch(depNames);
    await Promise.all(
      depNames.map(async name =>
        this.loadRegistryPackage({
          name,
          version: dependencies[name],
          parentNode: fullName
        })
      )
    );
  }

  resolveVersion(
    requestedVersion: string,
    registryPackage: { "dist-tags": any; versions: any; name: string }
  ) {
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

    let version = semver.maxSatisfying(
      availableVersions,
      requestedVersion,
      true
    );

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
      this.error = {
        error: "UNSATISFIED_RANGE",
        data: { name: registryPackage.name, range: requestedVersion }
      };
    } else {
      return version;
    }
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

  // Jpack Rendering
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
      this.packageJsonProps.forEach((prop: string) => {
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

  async resolve(dependencies: any) {
    const depNames = Object.keys(dependencies);

    await Promise.all(
      depNames.map(async name => {
        const res = await this.loadRegistryPackage({
          name,
          version: dependencies[name],
          parentNode: "root"
        });
        // this.validatePeerDependencies();
        this.renderJpack();
        return res;
      })
    );
    await this.registry.batchFetch(depNames);
  }
}

import { Registry } from "./Registry";
import semver from "semver";
import { Graph } from "graphlib";
import { Renderer } from "./Renderer";

export type Task = {
  name: string;
  version: string;
  parentNode: string;
};

export class Resolver {
  private graph: Graph = new Graph();
  private invalidPeers: {
    [name: string]: {
      [subname: string]: string;
    };
  } = {};
  private missingPeers: {
    [name: string]: {
      [subname: string]: string;
    };
  } = {};
  private requestedPeers: {
    [name: string]: {
      [subname: string]: string;
    };
  } = {};
  private queue: Task[] = [];
  private registry: Registry = new Registry({
    registryUrl: "https://registry.npmjs.cf/"
  });
  private validatePeers: boolean = true;

  public async load(deps: { [key: string]: string }) {
    const depNames = Object.keys(deps);
    depNames.forEach(name =>
      this.queue.push({
        name,
        version: deps[name],
        parentNode: "root"
      })
    );
    await this.registry.batchFetch(depNames);
  }

  public async hydrate(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }
    const processing = [...this.queue];
    this.queue = [];
    await Promise.all(
      processing.map(async task => {
        return this.loadRegistryPackage(task);
      })
    );
    await this.hydrate();
  }
  public getResult() {
    if (this.validatePeers) {
      this.validatePeerDependencies();
    }
    const renderer = new Renderer(this.graph, this.registry, this.invalidPeers);
    renderer.renderResult();
    return renderer.result;
  }

  private async loadRegistryPackage(task: Task) {
    const name = task.name;
    try {
      const registryPackage = await this.registry.fetch(name);
      await this.resolveDependencies(task, registryPackage);
    } catch {
      return Promise.reject({
        error: "PACKAGE_NOT_FOUND",
        data: { name }
      });
    }
  }
  // Resolution & Iteration
  private async resolveDependencies(task: Task, registryPackage: any) {
    const version = resolveVersion(task.version, registryPackage);
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
      return;
    }
    const dependencies = {
      ...versionPackageJson.dependencies,
      ...(isRootDependency ? {} : versionPackageJson.peerDependencies)
    };
    if (
      isRootDependency &&
      versionPackageJson.hasOwnProperty("peerDependencies") &&
      Object.keys(versionPackageJson.peerDependencies).length
    ) {
      this.requestedPeers[fullName] = {
        ...versionPackageJson.peerDependencies
      };
      Object.keys(versionPackageJson.peerDependencies).forEach(peerName =>
        this.graph.setEdge(fullName, peerName)
      );
    }
    const depNames = Object.keys(dependencies);
    await this.registry.batchFetch(depNames);
    depNames.forEach(name =>
      this.queue.push({
        name,
        version: dependencies[name],
        parentNode: fullName
      })
    );
  }
  validatePeerDependencies() {
    const topDeps = this.graph.successors("root") as string[];
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
      return Promise.reject({
        error: "MISSING_PEERS",
        data: this.missingPeers
      });
    }
  }
}

function resolveVersion(
  requestedVersion: string,
  registryPackage: {
    "dist-tags": { [version: string]: string };
    versions: any;
    name: string;
  }
): string {
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
    console.error({
      error: "UNSATISFIED_RANGE",
      data: { name: registryPackage.name, range: requestedVersion }
    });
    throw new Error("UNSATISFIED_RANGE");
  } else {
    return version;
  }
}

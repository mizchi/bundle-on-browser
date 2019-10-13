import { Registry, cache } from "./Registry";
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

export class Renderer {
  result: {
    appDependencies: any;
    resDependencies: any;
    warnings: any;
  } = {
    appDependencies: {},
    resDependencies: {},
    warnings: {}
  };
  constructor(
    private graph: Graph,
    private registry: Registry,
    private invalidPeers: any
  ) {}

  public renderResult() {
    (this.graph.successors("root") as string[]).forEach((depName: string) => {
      const { version, fullName } = this.graph.node(depName);
      const versionPkg = cache[depName].versions[version];
      const appDep = (this.result.appDependencies[depName] = {
        version,
        dependencies: {}
      });
      this.fillResultDeps(fullName, versionPkg, appDep);
    });

    if (Object.keys(this.invalidPeers).length) {
      this.result.warnings.invalidPeers = this.invalidPeers;
    }
  }
  private fillResultDeps(
    fullName: string,
    versionPkg: string | null,
    dep: any
  ) {
    (this.graph.successors(fullName) as string[]).forEach((name: string) => {
      if (name.substr(1).indexOf("@") === -1) {
        // dependency is a peer
        const peerDep = this.graph.node(name);
        if (peerDep) {
          dep.dependencies[name] = `${name}@${peerDep.version}`;
        }
      } else {
        dep.dependencies[name.substr(0, name.lastIndexOf("@"))] = name;
        this.addResultResDep(name);
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
  private addResultResDep(fullName: string) {
    if (!this.result.resDependencies.hasOwnProperty(fullName)) {
      // TODO: encode this information in nodes instead of using string ops
      const atIndex = fullName.lastIndexOf("@");
      if (atIndex <= 0) {
        // No '@' in string, or only '@' is first character (dependency is a peer)
        this.fillResultDeps(
          fullName,
          null,
          this.result.appDependencies[fullName]
        );
      } else {
        const depName = fullName.substr(0, atIndex);
        const version = fullName.substr(atIndex + 1);
        const versionPkg = cache[depName].versions[version];
        const resDep = (this.result.resDependencies[fullName] = {
          dependencies: {}
        });
        this.fillResultDeps(fullName, versionPkg, resDep);
      }
    }
  }
}

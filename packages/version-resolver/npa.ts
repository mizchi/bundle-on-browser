// npm-package-arg
import semver from "semver";
// import path from "path";
// import url from "url";
import validatePackageName from "validate-npm-package-name";
// import HostedGit from "hosted-git-info";

const hasSlashes = /[/]/;
const isURL = /^(?:git[+])?[a-z]+:/i;
const isFilename = /[.](?:tgz|tar.gz|tar)$/i;
// const isFilespec = /^(?:[.]|~[/]|[/]|[a-zA-Z]:)/;

export default function npa(arg: any, where?: any): any {
  let name;
  let spec;
  if (typeof arg === "object") {
    if (arg instanceof Result && (!where || where === arg.where)) {
      return arg;
    } else if (arg.name && arg.rawSpec) {
      return resolve(arg.name, arg.rawSpec, where || arg.where);
    } else {
      return npa(arg.raw, where || arg.where);
    }
  }
  const nameEndsAt =
    arg[0] === "@" ? arg.slice(1).indexOf("@") + 1 : arg.indexOf("@");
  const namePart = nameEndsAt > 0 ? arg.slice(0, nameEndsAt) : arg;
  if (isURL.test(arg)) {
    spec = arg;
  } else if (
    namePart[0] !== "@" &&
    (hasSlashes.test(namePart) || isFilename.test(namePart))
  ) {
    spec = arg;
  } else if (nameEndsAt > 0) {
    name = namePart;
    spec = arg.slice(nameEndsAt + 1);
  } else {
    const valid = validatePackageName(arg);
    if (valid.validForOldPackages) {
      name = arg;
    } else {
      spec = arg;
    }
  }
  return resolve(name, spec, where, arg);
}

function resolve(name: string, spec: any, where: any, arg?: any) {
  const res = new Result({
    raw: arg,
    name: name,
    rawSpec: spec,
    fromArgument: arg != null
  });

  if (name) res.setName(name);

  return fromRegistry(res);

  // if (spec && (isFilespec.test(spec) || /^file:/i.test(spec))) {
  //   return fromFile(res, where);
  // } else if (spec && /^npm:/i.test(spec)) {
  //   return fromAlias(res, where);
  // }
  // const hosted = HostedGit.fromUrl(spec, {
  //   noGitPlus: true,
  //   noCommittish: true
  // });
  // if (hosted) {
  //   return fromHostedGit(res, hosted);
  // } else if (spec && isURL.test(spec)) {
  //   return fromURL(res);
  // } else if (spec && (hasSlashes.test(spec) || isFilename.test(spec))) {
  //   return fromFile(res, where);
  // } else {
  //   return fromRegistry(res);
  // }
}

function invalidPackageName(name: string, valid: validatePackageName.Result) {
  const err = new Error(
    // @ts-ignore
    `Invalid package name "${name}": ${valid.errors.join("; ")}`
  );
  // @ts-ignore
  err.code = "EINVALIDPACKAGENAME";
  return err;
}

function invalidTagName(name: string) {
  const err = new Error(
    `Invalid tag name "${name}": Tags may not have any characters that encodeURIComponent encodes.`
  );
  // @ts-ignore
  err.code = "EINVALIDTAGNAME";
  return err;
}

class Result {
  type: any;
  registry: any;
  where: any;
  name: any;
  raw: any;
  escapedName: any;
  scope: any;
  rawSpec: string;
  saveSpec: any;
  fetchSpec: any;
  gitRange: any;
  gitCommittish: any;
  hosted?: boolean;

  constructor(opts: {
    fromArgument: boolean;
    type?: string;
    registry?: any;
    where?: any;
    raw?: string;
    name?: string;
    rawSpec?: string;
    saveSpec?: string;
    fetchSpec?: string;
    gitRange?: any;
    gitCommittish?: boolean;
    hosted?: boolean;
  }) {
    this.type = opts.type;
    this.registry = opts.registry;
    this.where = opts.where;
    if (opts.raw == null) {
      this.raw = opts.name ? opts.name + "@" + opts.rawSpec : opts.rawSpec;
    } else {
      this.raw = opts.raw;
    }
    this.name = undefined;
    this.escapedName = undefined;
    this.scope = undefined;
    this.rawSpec = opts.rawSpec == null ? "" : opts.rawSpec;
    this.saveSpec = opts.saveSpec;
    this.fetchSpec = opts.fetchSpec;
    if (opts.name) this.setName(opts.name);
    this.gitRange = opts.gitRange;
    this.gitCommittish = opts.gitCommittish;
    this.hosted = opts.hosted;
  }
  setName(name: string) {
    const valid = validatePackageName(name);
    if (!valid.validForOldPackages) {
      throw invalidPackageName(name, valid);
    }
    this.name = name;
    this.scope = name[0] === "@" ? name.slice(0, name.indexOf("/")) : undefined;
    // scoped packages in couch must have slash url-encoded, e.g. @foo%2Fbar
    this.escapedName = name.replace("/", "%2f");
    return this;
  }

  // toString() {
  //   const full = [];
  //   if (this.name != null && this.name !== "") full.push(this.name);
  //   const spec = this.saveSpec || this.fetchSpec || this.rawSpec;
  //   if (spec != null && spec !== "") full.push(spec);
  //   return full.length ? full.join("@") : this.raw;
  // }

  // toJSON() {
  //   const result = Object.assign({}, this);
  //   delete result.hosted;
  //   return result;
  // }
}

// function setGitCommittish(res: any, committish: any) {
//   if (
//     committish != null &&
//     committish.length >= 7 &&
//     committish.slice(0, 7) === "semver:"
//   ) {
//     res.gitRange = decodeURIComponent(committish.slice(7));
//     res.gitCommittish = null;
//   } else {
//     res.gitCommittish = committish === "" ? null : committish;
//   }
//   return res;
// }

// const isAbsolutePath = /^[/]|^[A-Za-z]:/;

// function resolvePath(where: string, spec: any) {
//   if (isAbsolutePath.test(spec)) return spec;
//   return path.resolve(where, spec);
// }

// function isAbsolute(dir: any) {
//   if (dir[0] === "/") return true;
//   if (/^[A-Za-z]:/.test(dir)) return true;
//   return false;
// }

// function fromFile(res: any, where: any) {
//   if (!where) where = process.cwd();
//   res.type = isFilename.test(res.rawSpec) ? "file" : "directory";
//   res.where = where;

//   const spec = res.rawSpec
//     .replace(/\\/g, "/")
//     .replace(/^file:[/]*([A-Za-z]:)/, "$1") // drive name paths on windows
//     .replace(/^file:(?:[/]*([~./]))?/, "$1");
//   if (/^~[/]/.test(spec)) {
//     throw new Error("unsupported protocol: file");
//     // res.fetchSpec = resolvePath(osenv.home(), spec.slice(2));
//     // res.saveSpec = "file:" + spec;
//   } else {
//     res.fetchSpec = resolvePath(where, spec);
//     if (isAbsolute(spec)) {
//       res.saveSpec = "file:" + spec;
//     } else {
//       res.saveSpec = "file:" + path.relative(where, res.fetchSpec);
//     }
//   }
//   return res;
// }

// function fromHostedGit(res: any, hosted: any) {
//   res.type = "git";
//   res.hosted = hosted;
//   res.saveSpec = hosted.toString({ noGitPlus: false, noCommittish: false });
//   res.fetchSpec =
//     hosted.getDefaultRepresentation() === "shortcut" ? null : hosted.toString();
//   return setGitCommittish(res, hosted.committish);
// }

// function unsupportedURLType(protocol: any, spec: any) {
//   const err = new Error(`Unsupported URL Type "${protocol}": ${spec}`);
//   // @ts-ignore
//   err.code = "EUNSUPPORTEDPROTOCOL";
//   return err;
// }

// function matchGitScp(spec: any) {
//   // git ssh specifiers are overloaded to also use scp-style git
//   // specifiers, so we have to parse those out and treat them special.
//   // They are NOT true URIs, so we can't hand them to `url.parse`.
//   //
//   // This regex looks for things that look like:
//   // git+ssh://git@my.custom.git.com:username/project.git#deadbeef
//   //
//   // ...and various combinations. The username in the beginning is *required*.
//   const matched = spec.match(
//     /^git\+ssh:\/\/([^:#]+:[^#]+(?:\.git)?)(?:#(.*))?$/i
//   );
//   return (
//     matched &&
//     !matched[1].match(/:[0-9]+\/?.*$/i) && {
//       fetchSpec: matched[1],
//       gitCommittish: matched[2] == null ? null : matched[2]
//     }
//   );
// }

// function fromURL(res: any) {
//   const urlparse = url.parse(res.rawSpec);
//   res.saveSpec = res.rawSpec;
//   // check the protocol, and then see if it's git or not
//   switch (urlparse.protocol) {
//     case "git:":
//     case "git+http:":
//     case "git+https:":
//     case "git+rsync:":
//     case "git+ftp:":
//     case "git+file:":
//     case "git+ssh:":
//       res.type = "git";
//       const match =
//         urlparse.protocol === "git+ssh:" && matchGitScp(res.rawSpec);
//       if (match) {
//         setGitCommittish(res, match.gitCommittish);
//         res.fetchSpec = match.fetchSpec;
//       } else {
//         setGitCommittish(
//           res,
//           urlparse.hash != null ? urlparse.hash.slice(1) : ""
//         );
//         urlparse.protocol = urlparse.protocol.replace(/^git[+]/, "");
//         if (
//           urlparse.protocol === "file:" &&
//           /^git\+file:\/\/[a-z]:/i.test(res.rawSpec)
//         ) {
//           // keep the drive letter : on windows file paths
//           urlparse.host += ":";
//           urlparse.hostname += ":";
//         }
//         delete urlparse.hash;
//         res.fetchSpec = url.format(urlparse);
//       }
//       break;
//     case "http:":
//     case "https:":
//       res.type = "remote";
//       res.fetchSpec = res.saveSpec;
//       break;

//     default:
//       throw unsupportedURLType(urlparse.protocol, res.rawSpec);
//   }

//   return res;
// }

// function fromAlias(res: any, where: any) {
//   const subSpec = npa(res.rawSpec.substr(4), where);
//   if (subSpec.type === "alias") {
//     throw new Error("nested aliases not supported");
//   }
//   if (!subSpec.registry) {
//     throw new Error("aliases only work for registry deps");
//   }
//   res.subSpec = subSpec;
//   res.registry = true;
//   res.type = "alias";
//   res.saveSpec = null;
//   res.fetchSpec = null;
//   return res;
// }

function fromRegistry(res: any) {
  res.registry = true;
  const spec = res.rawSpec === "" ? "latest" : res.rawSpec;
  // no save spec for registry components as we save based on the fetched
  // version, not on the argument so this can't compute that.
  res.saveSpec = null;
  res.fetchSpec = spec;
  const version = semver.valid(spec, true);
  const range = semver.validRange(spec, true);
  if (version) {
    res.type = "version";
  } else if (range) {
    res.type = "range";
  } else {
    if (encodeURIComponent(spec) !== spec) {
      throw invalidTagName(spec);
    }
    res.type = "tag";
  }
  return res;
}

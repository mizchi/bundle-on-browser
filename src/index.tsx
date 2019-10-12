import { h, render } from "preact";
import Resolver from "./local-resolver/resolver";
import NpmHttpRegistry from "./local-resolver/npm-http";

function resolve(dependencies: any) {
  const resolver = new Resolver({
    registry: new NpmHttpRegistry({ registryUrl: "https://registry.npmjs.cf/" })
  });
  return resolver.resolve(dependencies);
}

resolve({
  rxjs: "~5.5.0",
  "left-pad": "*",
  "zone.js": "latest",
  "@angular/core": "~5.2.0"
}).then(results => console.log(results));

const root = document.querySelector(".root") as HTMLDivElement;
render(<div>Hello2</div>, root);

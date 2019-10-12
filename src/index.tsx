import { h, render } from "preact";
import resolve from "./local-resolver/resolver";

resolve({
  rxjs: "~5.5.0",
  "left-pad": "*",
  "zone.js": "latest",
  "@angular/core": "~5.2.0"
}).then(results => console.log(results));

const root = document.querySelector(".root") as HTMLDivElement;
render(<div>Hello2</div>, root);

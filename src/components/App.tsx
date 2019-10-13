import React from "react";
import { Preview } from "./Preview";
import { Editor } from "./Editor";
import { Filer } from "./Filer";

export function App() {
  return (
    <div style={{ padding: 0, margin: 0, display: "flex" }}>
      <div style={{ width: "180px" }}>
        <Filer />
      </div>
      <div style={{ flex: 1 }}>
        <Editor />
      </div>
      <div style={{ flex: 1 }}>
        <Preview />
      </div>
    </div>
  );
}

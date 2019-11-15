import React from "react";
import { Preview } from "./Preview";
import MonacoEditor from "./MonacoEditor";
import { Filer } from "./Filer";
import { Tools } from "./Tools";

import { LayoutData, Windowed, EditableLayout } from "react-unite";

export function App() {
  return (
    <Windowed>
      {(width, height) => (
        <EditableLayout
          width={width}
          height={height}
          layout={initialLayoutData}
          renderTab={data => {
            return <span>{data.displayName}</span>;
          }}
          renderWindow={win => {
            if (win.id === "#editor") {
              return <MonacoEditor />;
            }

            if (win.id === "#filer") {
              return (
                <div style={{ width: "100%", height: "100%" }}>
                  <Filer />
                </div>
              );
            }
            if (win.id === "#tools") {
              return (
                <div style={{ width: "100%", height: "100%" }}>
                  <Tools />
                </div>
              );
            }

            if (win.id === "#preview") {
              return <Preview />;
            }
            return (
              <div>
                {win.id}: {win.displayName}
              </div>
            );
          }}
        />
      )}
    </Windowed>
  );
}

const initialLayoutData: LayoutData = {
  grid: {
    columns: ["200px", "3fr", "2fr"],
    rows: ["1px", "200px", "1fr"],
    areas: [
      ["header", "header", "header"],
      ["side", "center", "right-top"],
      ["side", "center", "right"]
    ]
  },
  windowMap: {
    "#tools": { displayName: "Tools", id: "#tools" },
    "#filer": { displayName: "Filer", id: "#filer" },
    "#preview": { displayName: "Preview", id: "#preview" },
    "#editor": { displayName: "Editor", id: "#editor" }
  },
  containers: [
    {
      id: "right-top",
      displayName: "Tools",
      selectedId: "#tools",
      windowIds: ["#tools"]
    },
    {
      id: "side",
      displayName: "Side",
      selectedId: "#filer",
      windowIds: ["#filer"]
    },
    {
      id: "center",
      displayName: "Center",
      selectedId: "#editor",
      windowIds: ["#editor"]
    },
    {
      id: "right",
      displayName: "Center",
      selectedId: "#preview",
      windowIds: ["#preview"]
    }
  ]
};

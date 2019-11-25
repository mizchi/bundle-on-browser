import React, { useCallback, useState, Suspense } from "react";
import { EditableLayout, LayoutData, Windowed } from "react-unite";
import { Filer } from "./windows/Filer";
import { Preview } from "./windows/Preview";
import { Tools } from "./windows/Tools";
import { KeyBindings } from "./Keybindings";
import { Workspace } from "./windows/Workspace";

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
    "#editor": { displayName: "Editor", id: "#editor" },
    "#workspace": { displayName: "Workspace", id: "#workspace" }
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
      windowIds: ["#filer", "#workspace"]
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

const MonacoEditor = React.lazy(() => import("./windows/MonacoEditor"));

export function App() {
  const [dragging, setDragging] = useState(false);
  const onDragStart = useCallback(() => {
    setDragging(true);
  }, []);
  const onDragEnd = useCallback(() => {
    setDragging(false);
  }, []);
  return (
    <>
      <KeyBindings />
      <Windowed>
        {(width, height) => (
          <EditableLayout
            width={width}
            height={height}
            layout={initialLayoutData}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            renderTab={data => {
              return <span>{data.displayName}</span>;
            }}
            renderWindow={win => {
              if (dragging) {
                return (
                  <div
                    style={{
                      boxSizing: "border-box",
                      width: "95%",
                      height: "95%",
                      backgroundColor: "#aaa"
                      // padding: 10
                    }}
                  />
                );
              }
              if (win.id === "#workspace") {
                return (
                  <Suspense fallback="Loading...">
                    <Workspace />
                  </Suspense>
                );
              }

              if (win.id === "#editor") {
                return (
                  <Suspense fallback="Loading...">
                    <MonacoEditor />
                  </Suspense>
                );
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
    </>
  );
}

export function WindowPane({
  dragging,
  windowId
}: {
  dragging: boolean;
  windowId: string;
}) {
  if (dragging) {
    return (
      <div
        style={{
          boxSizing: "border-box",
          width: "95%",
          height: "95%",
          backgroundColor: "#aaa"
          // padding: 10
        }}
      />
    );
  }

  switch (windowId) {
    case "#workspace": {
      return <Workspace />;
    }

    case "#editor": {
      return (
        <Suspense fallback="Loading...">
          <MonacoEditor />
        </Suspense>
      );
    }

    case "#filer": {
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <Filer />
        </div>
      );
    }
    case "#tools": {
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <Tools />
        </div>
      );
    }

    case "#preview": {
      return <Preview />;
    }
  }
  return <div>{windowId}</div>;
}

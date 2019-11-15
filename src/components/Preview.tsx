import React, { useCallback, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { State } from "../store";
import { EditableGrid, Fill, GridData, GridArea, Grid } from "react-unite";

const initialGrid: GridData = {
  rows: ["10px", "1fr", "10px"],
  columns: ["10px", "1fr", "10px"],
  areas: [
    ["0", "1", "2"],
    ["3", "c", "5"],
    ["6", "7", "8"]
  ]
};

export function Preview() {
  const [grid, setGrid] = useState(initialGrid);
  return (
    <Fill>
      {(width, height) => {
        return (
          <EditableGrid
            // key={`${width}-${height}`}
            width={width}
            height={height}
            spacerSize={10}
            rows={grid.rows}
            columns={grid.columns}
            areas={grid.areas}
            onChangeGridData={data => {
              setGrid(data);
              // props.onChangeGrid(data);
            }}
          >
            <div style={{ gridArea: "c", overflow: "hidden" }}>
              <_Preview />
            </div>
          </EditableGrid>
        );
      }}
    </Fill>
  );
}

export function _Preview() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [previewedCode, setPreviewCode] = useState<string | null>(null);
  const { dist } = useSelector((s: State) => {
    return {
      dist: s.dist
    };
  });
  useEffect(() => {
    if (ref.current) {
      // debugger;
      if (dist?.code && previewedCode !== dist.code) {
        // console.log("built changed");
        ref.current.src = createIframeBlob(dist.code);
        setPreviewCode(dist.code);
      }
    }
  }, [previewedCode, dist?.code]);

  return (
    <iframe
      ref={ref}
      scrolling="no"
      frameBorder="no"
      style={{
        overflow: "hidden",
        backgroundColor: "#eee",
        boxSizing: "border-box",
        width: "100%",
        height: "100%"
      }}
    />
  );
}

function createIframeBlob(code: string) {
  const html = `<html><head><style>html,body{margin:0;padding:0}</style></head><body><script>${code}</script></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

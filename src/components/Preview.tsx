import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { EditableGrid, Fill, GridData } from "react-unite";
import { State } from "../store";

const initialGrid: GridData = {
  rows: ["1px", "1fr", "1px"],
  columns: ["1px", "1fr", "1px"],
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
            width={width}
            height={height}
            spacerSize={16}
            rows={grid.rows}
            columns={grid.columns}
            areas={grid.areas}
            showVertical={false}
            showHorizontal={false}
            onChangeGridData={data => {
              setGrid(data);
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
      if (dist?.code && previewedCode !== dist.code) {
        ref.current.src = createIframeBlob(dist.code);
        setPreviewCode(dist.code);
      }
    }
  }, [previewedCode, dist?.code]);

  if (dist?.code) {
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
  } else {
    return (
      <div>
        Click <code>Bundle &amp; Run</code> for preview
      </div>
    );
  }
}

function createIframeBlob(code: string) {
  const html = `<html><head><style>html,body{margin:0;padding:0}</style></head><body><script>${code}</script></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

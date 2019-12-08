import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { EditableGrid, GridData, useElementSize } from "react-unite";
import { State } from "../../reducers";

const initialGrid: GridData = {
  rows: ["1px", "1fr", "1px"],
  columns: ["1px", "1fr", "1px"],
  areas: [
    ["0", "1", "2"],
    ["3", "c", "5"],
    ["6", "7", "8"]
  ]
};

export default function Preview() {
  const ref = useRef(null);
  const size = useElementSize(ref);
  const [grid, setGrid] = useState(initialGrid);
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {size && (
        <EditableGrid
          width={size.width}
          height={size.height}
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
      )}
    </div>
  );
}

export function _Preview() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [previewedCode, setPreviewCode] = useState<string | null>(null);
  const { preview } = useSelector((s: State) => {
    return {
      preview: s.preview
    };
  });
  useEffect(() => {
    if (ref.current) {
      if (preview?.previewCode && previewedCode !== preview.previewCode) {
        ref.current.src = createIframeBlob(preview.previewCode);
        setPreviewCode(preview.previewCode);
      }
    }
  }, [previewedCode, preview?.previewCode]);
  console.log("previewCode", preview);

  if (preview?.previewCode) {
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
        Click <code>Preview</code>
      </div>
    );
  }
}

function createIframeBlob(code: string) {
  const html = `<html><head><style>html,body{margin:0;padding:0}</style></head><body><script type="module">${code}</script></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

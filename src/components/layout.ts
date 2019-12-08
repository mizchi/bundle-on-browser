import { LayoutData } from "react-unite";

export enum PaneID {
  RIGHT_TOP = "right-top",
  RIGHT = "right",
  HEADER = "header",
  SIDE = "side",
  CENTER = "center"
}

export enum WindowID {
  TOOLS = "#tools",
  FILER = "#FILER",
  PREVIEW = "#PREVIEW",
  EDITOR = "#editor",
  WORKSPACE = "#WORKSPACE"
}

export const initialLayoutData: LayoutData = {
  grid: {
    columns: ["200px", "3fr", "2fr"],
    rows: ["1px", "200px", "1fr"],
    areas: [
      [PaneID.HEADER, PaneID.HEADER, PaneID.HEADER],
      [PaneID.SIDE, PaneID.CENTER, PaneID.RIGHT_TOP],
      [PaneID.SIDE, PaneID.CENTER, PaneID.RIGHT]
    ]
  },
  windows: {
    [WindowID.TOOLS]: { id: WindowID.TOOLS, displayName: "Tools" },
    [WindowID.FILER]: { id: WindowID.FILER, displayName: "Filer" },
    [WindowID.PREVIEW]: { id: WindowID.PREVIEW, displayName: "Preview" },
    [WindowID.EDITOR]: { id: WindowID.EDITOR, displayName: "Editor" },
    [WindowID.WORKSPACE]: { id: WindowID.WORKSPACE, displayName: "Workspace" }
  },
  panes: [
    {
      id: PaneID.RIGHT_TOP,
      displayName: "Tools",
      selectedId: WindowID.TOOLS,
      windowIds: [WindowID.TOOLS]
    },
    {
      id: PaneID.SIDE,
      displayName: PaneID.SIDE,
      selectedId: WindowID.FILER,
      windowIds: [WindowID.FILER, WindowID.WORKSPACE]
    },
    {
      id: PaneID.CENTER,
      displayName: "Center",
      selectedId: WindowID.EDITOR,
      windowIds: [WindowID.EDITOR]
    },
    {
      id: PaneID.RIGHT,
      showTab: false,
      displayName: "Center",
      selectedId: WindowID.PREVIEW,
      windowIds: [WindowID.PREVIEW]
    }
  ]
};

import React from "react";
import { LayoutSystem, useWindowSize, WindowManager } from "react-unite";
import { WindowID, initialLayoutData } from "./layout";

const windowManager = new WindowManager();
windowManager.registerWindow(
  WindowID.WORKSPACE,
  React.lazy(() => import("../components/windows/Workspace"))
);
windowManager.registerWindow(
  WindowID.FILER,
  React.lazy(() => import("../components/windows/Filer"))
);
windowManager.registerWindow(
  WindowID.EDITOR,
  React.lazy(() => import("../components/windows/MonacoEditor"))
);
windowManager.registerWindow(
  WindowID.PREVIEW,
  React.lazy(() => import("../components/windows/Preview"))
);
windowManager.registerWindow(
  WindowID.TOOLS,
  React.lazy(() => import("../components/windows/Tools"))
);

export function App() {
  const size = useWindowSize();
  return (
    <LayoutSystem
      width={size.width}
      height={size.height}
      windowManager={windowManager}
      initialLayout={initialLayoutData}
    />
  );
}

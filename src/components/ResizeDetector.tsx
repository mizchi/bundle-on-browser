import React from "react";
import { useLayoutEffect, useRef } from "react";

declare var ResizeObserver: any;

type Rect = {
  x: string;
  y: string;
  width: string;
  height: string;
  top: string;
  right: string;
  bottom: string;
  left: string;
};

export function ResizeDetector(props: {
  children: any;
  onResize: (rect: Rect) => void;
  style?: any;
}) {
  const containerRef: any = useRef(null as any);
  useLayoutEffect(() => {
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(
        (
          entries: Array<{
            target: HTMLElement;
            contentRect: Rect;
          }>
        ) => {
          entries.forEach(({ contentRect }) => {
            props.onResize(contentRect);
          });
        }
      );
      observer.observe(containerRef.current);
      return () => {
        observer.unobserve(containerRef.current);
        observer.disconnect();
      };
    }
  }, [props.children]);
  return (
    <div style={props.style} ref={containerRef}>
      {props.children}
    </div>
  );
}

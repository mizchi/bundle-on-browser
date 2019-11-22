import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { writeToNativeFs, loadFromNativeFS } from "../reducers/actions";
// @ts-ignore
const hasFileSystemApi: boolean = !!window.chooseFileSystemEntries;

export function KeyBindings() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fn = (ev: KeyboardEvent) => {
      // console.log("key", ev.key);
      if (ev.metaKey && ev.key === "s") {
        if (hasFileSystemApi) {
          ev.preventDefault();
          dispatch(writeToNativeFs());
        }
      }

      if (ev.metaKey && ev.key === "o") {
        if (hasFileSystemApi) {
          ev.preventDefault();
          dispatch(loadFromNativeFS());
        }
      }
    };
    window.addEventListener("keydown", fn);
    return () => {
      window.removeEventListener("keydown", fn);
    };
  }, []);
  return <></>;
}

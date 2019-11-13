import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "..";
import * as mfs from "../helpers/monacoFileSystem";

export function Filer() {
  const { files, currentFileId } = useSelector((s: State) => {
    return { files: s.files, currentFileId: s.editing.filepath };
  });
  const dispatch = useDispatch();
  return (
    <div style={{ paddingLeft: 10 }}>
      {files.map(f => {
        return (
          <div
            style={{
              textDecoration:
                f.filepath === currentFileId ? "underline" : "none"
            }}
            key={f.filepath}
          >
            <span
              onClick={() => {
                dispatch({
                  type: "select-file",
                  payload: { filepath: f.filepath }
                });
              }}
            >
              {f.filepath}
            </span>
            &nbsp;
            <DeleteFileButton filepath={f.filepath} />
          </div>
        );
      })}
      <AddFileButton />
    </div>
  );
}

function DeleteFileButton(props: { filepath: string }) {
  const dispatch = useDispatch();

  const onClick = useCallback(() => {
    // TODO: select other file before delete

    mfs.deleteFile(props.filepath);
    const json = mfs.toJSON();

    dispatch({
      type: "update-files",
      payload: {
        files: Object.keys(json).map(f => ({ filepath: f }))
      }
    });
  }, []);
  return <button onClick={onClick}>x</button>;
}

function AddFileButton() {
  const dispatch = useDispatch();
  const [adding, setAdding] = useState(false);
  const onClickAdd = useCallback(() => {
    setAdding(true);
  }, [adding]);

  const onDefine = useCallback((filepath: string) => {
    // debugger;
    // TODO: Refactor to actions
    mfs.writeFile(filepath, "");
    const json = mfs.toJSON();
    dispatch({
      type: "update-files",
      payload: {
        files: Object.keys(json).map(f => ({ filepath: f }))
      }
    });

    dispatch({
      type: "select-file",
      payload: { filepath }
    });

    setAdding(false);
  }, []);

  const onCancel = useCallback(() => {
    setAdding(false);
  }, []);
  if (adding) {
    return <InputFileName onDefine={onDefine} onCancel={onCancel} />;
  } else {
    return <button onClick={onClickAdd}>Add</button>;
  }
}

function InputFileName(props: {
  onDefine: (name: string) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const onKeyDown = useCallback(
    ev => {
      console.log("xxx", ev.key, ev.target.value);
      if (ev.key === "Escape") {
        props.onCancel();
      }
      if (ev.key === "Enter") {
        props.onDefine(ev.target.value);
      }
    },
    [props.onDefine, props.onCancel]
  );
  const onBlur = useCallback(() => {
    props.onCancel();
  }, [props.onCancel]);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);
  return <input ref={ref} onKeyDown={onKeyDown} onBlur={onBlur} />;
}

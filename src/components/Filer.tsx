import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store/index";
import { deleteFile, addFile, selectFile, reset } from "../store/actions";

export function Filer() {
  const { files, currentFileId } = useSelector((s: State) => {
    return { files: s.files, currentFileId: s.editing.filepath };
  });
  const dispatch = useDispatch();
  const localFiles = files.filter(f => !f.filepath.startsWith("/http"));
  const remoteFiles = files.filter(f => f.filepath.startsWith("/http"));

  return (
    <div style={{ paddingLeft: 10 }}>
      {localFiles.map(f => {
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
                dispatch(selectFile(f.filepath));
              }}
            >
              {f.filepath}
            </span>
            &nbsp;
            <DeleteFileButton filepath={f.filepath} />
          </div>
        );
      })}
      <details>
        <summary
          style={{ border: "none", outline: "none", userSelect: "none" }}
        >
          npm
        </summary>
        {remoteFiles.map(f => {
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
                  dispatch(selectFile(f.filepath));
                }}
              >
                {f.filepath}
              </span>
              &nbsp;
              <DeleteFileButton filepath={f.filepath} />
            </div>
          );
        })}
      </details>
      <AddFileButton />
      <div>
        <button
          onClick={() => {
            const confirmed = confirm("Remove all and restart");
            if (confirmed) {
              dispatch(reset());
            }
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function DeleteFileButton(props: { filepath: string }) {
  const dispatch = useDispatch();

  const onClick = useCallback(() => {
    dispatch(deleteFile(props.filepath));
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
    dispatch(addFile(filepath));
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

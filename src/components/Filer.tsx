import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store/index";
import {
  deleteFile,
  addFile,
  selectFile,
  reset,
  loadPreset
} from "../store/actions";
import { Menu, Tree, ITreeNode, ContextMenu, Button } from "@blueprintjs/core";

function toTree(
  files: Array<{ filepath: string }>,
  parent: string = "/"
): Array<ITreeNode> {
  files.filter(f => f.filepath.startsWith(parent));
  return [];
}

function FileText(props: {
  text: string;
  selected: boolean;
  onClick: Function;
}) {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const onClickTrash = useCallback(() => {
    dispatch(deleteFile(props.text));
  }, [props.text]);
  const onContextMenu = useCallback((ev: any) => {
    ev.preventDefault();
    if (ref.current) {
      ContextMenu.show(
        <Menu>
          <Menu.Item label="Delete" icon="trash" onClick={onClickTrash} />
        </Menu>,
        { left: ev.clientX, top: ev.clientY },
        () => {
          console.log("xxx");
        }
      );
    }
  }, []);
  return (
    <div
      ref={ref}
      onContextMenu={onContextMenu}
      style={{ color: props.selected ? "red" : "inherit" }}
      onClick={props.onClick as any}
    >
      {props.text}
    </div>
  );
}

export function Filer() {
  const { files, currentFileId } = useSelector((s: State) => {
    return { files: s.files, currentFileId: s.editing.filepath };
  });
  const dispatch = useDispatch();
  const localFiles = files.filter(f => !f.filepath.startsWith("/http"));
  const remoteFiles = files.filter(f => f.filepath.startsWith("/http"));

  return (
    <Menu>
      <Tree
        contents={localFiles.map(f => ({
          id: f.filepath,
          label: (
            <FileText
              onClick={() => {
                dispatch(selectFile(f.filepath));
              }}
              text={f.filepath}
              selected={currentFileId === f.filepath}
            />
          ),
          icon: "document"
        }))}
      />
      <AddFileButton />

      <hr />
      <h3>Load presets</h3>
      <div>
        {["playground", "react", "preact", "svelte", "vue"].map(presetName => {
          return (
            <Button
              key={presetName}
              text={presetName}
              onClick={() => {
                dispatch(loadPreset(presetName));
              }}
            />
          );
        })}
      </div>

      <hr />
      <details>
        <summary
          style={{ border: "none", outline: "none", userSelect: "none" }}
        >
          npm
        </summary>
        <Tree
          contents={remoteFiles.map(f => ({
            id: f.filepath,
            label: (
              <FileText
                onClick={() => {
                  dispatch(selectFile(f.filepath));
                }}
                text={f.filepath}
                selected={currentFileId === f.filepath}
              />
            ),
            icon: "document"
          }))}
        />
      </details>
      <div>
        <Button
          onClick={() => {
            const confirmed = confirm("Remove all and restart");
            if (confirmed) {
              dispatch(reset());
            }
          }}
          text="Reset"
        />
      </div>
    </Menu>
  );
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
    return <Button icon="plus" onClick={onClickAdd} text="Add" />;
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
  return (
    <input
      className="bp3-input"
      ref={ref}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    />
  );
}

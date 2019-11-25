import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../reducers";
import path from "path";
import { deleteFile, addFile, selectFile } from "../../reducers/actions";
import { Menu, Tree, ITreeNode, ContextMenu, Button } from "@blueprintjs/core";
import groupBy from "lodash-es/groupBy";

export function Filer() {
  const { files, currentFileId } = useSelector((s: State) => {
    return { files: s.files, currentFileId: s.editing.filepath };
  });
  const [openIds, setOpenIds] = useState<string[]>([]);

  const dispatch = useDispatch();

  const contents = toTree(files, openIds, currentFileId);
  return (
    <Menu>
      <Tree
        contents={contents}
        onNodeClick={(p, ev) => {
          const id = p.id as any;
          const found = files.find(f => f.filepath === id);
          if (found) {
            dispatch(selectFile(id));
          }
        }}
        onNodeCollapse={(p, ev) => {
          console.log(p);
          setOpenIds(openIds.filter(id => id !== p.id));
        }}
        onNodeExpand={(p, ev) => {
          console.log(p);
          setOpenIds([...openIds, p.id as any]);
        }}
      />
      <AddFileButton />
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

function toTree(
  files: Array<{ filepath: string }>,
  openIds: string[],
  currentFileId: string
): Array<ITreeNode> {
  const names = files.map(f => f.filepath);
  names.sort();
  const splits = names.map(f => f.split("/").filter(f => f.length > 0));

  function buildTreeNode(
    paths: string[][],
    parentPath: string = "/"
  ): ITreeNode[] {
    const files = paths.filter(f => f.length === 1);
    const withDirs = paths.filter(f => f.length > 1);
    const ret: ITreeNode[] = [];

    const dirs = groupBy(withDirs, w => w[0]);
    Object.entries(dirs).map(([dirname, items]) => {
      const label = dirname;
      const id = path.join("/", parentPath, dirname);
      const shifted = items.map(i => i.slice(1));
      ret.push({
        id,
        label,
        childNodes: buildTreeNode(shifted, id + "/"),
        isExpanded: openIds.includes(id)
      });
    });

    for (const file of files) {
      const name = file[0];
      const id = parentPath + name;
      ret.push({
        id: id,
        label: <FileText id={id} label={name} selected={currentFileId === id} />
      });
    }

    return ret;
  }

  return buildTreeNode(splits);
  // const buf = [];

  // for (const split of splits) {
  //   let pt = [];
  //   for (const cur of split) {
  //     pt.push(cur);
  //     // path.push(cur)
  //   }
  // }

  // files.filter(f => f.filepath.startsWith(parent));
  // return [];
}

function FileText(props: {
  id: string;
  label: string;
  selected: boolean;
  // onClick: Function;
}) {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const onClickTrash = useCallback(() => {
    dispatch(deleteFile(props.id));
  }, [props.id]);
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
    >
      {props.label}
    </div>
  );
}

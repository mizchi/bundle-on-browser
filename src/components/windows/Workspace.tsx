import React, { useState } from "react";
import { Button } from "@blueprintjs/core";
import { useDispatch } from "react-redux";
import { loadPreset, reset } from "../../reducers/actions";

const presetNames = ["playground", "react", "preact", "svelte", "vue"];

export function Workspace() {
  const dispatch = useDispatch();
  const [preset, setPreset] = useState<string>(presetNames[0]);
  return (
    <div
      style={{ overflow: "auto", height: "100%", width: "100%", padding: 10 }}
    >
      <h3>Load workspace</h3>
      TODO
      <h3>Create new workspace</h3>
      <div className="bp3-select">
        <select
          value={preset}
          onChange={ev => {
            setPreset(ev.target.value);
          }}
        >
          {presetNames.map(presetName => {
            return (
              <option key={presetName} value={presetName}>
                {presetName}
              </option>
            );
          })}
        </select>
      </div>
      <Button
        onClick={() => {
          dispatch(loadPreset(preset as any));
        }}
        text="create"
      />
      <hr />
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
    </div>
  );
}

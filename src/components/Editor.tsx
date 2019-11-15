// import React, { useCallback } from "react";
// import MonacoEditor from "./MonacoEditor";
// import { useSelector, useDispatch } from "react-redux";
// import { State } from "../store/index";
// import path from "path";

// export function Editor() {
//   const dispatch = useDispatch();
//   const { currentFilename } = useSelector((s: State) => {
//     return {
//       files: s.files,
//       currentFilename: s.editing.filepath
//     };
//   });
//   console.log("editor", "render", currentFilename);

//   const onChangeValue = useCallback((filename: string, content: string) => {
//     dispatch({
//       type: "update-file",
//       payload: {
//         filename,
//         content
//       }
//     });
//   }, []);

//   return (
//     // <div style={{ width: "50vw" }}>
//     <MonacoEditor
//       filepath={path.resolve(currentFilename)}
//       onChangeValue={onChangeValue}
//       width="calc(100vw / 2)"
//     />
//     // </div>
//   );
// }

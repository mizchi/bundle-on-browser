/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";

// @ts-ignore
import * as worker from "monaco-editor-core/esm/vs/editor/editor.worker";
import { TypeScriptWorker } from "./tsWorker";

self.onmessage = () => {
  // ignore the first message
  worker.initialize((ctx: any, createData: any) => {
    return new TypeScriptWorker(ctx, createData);
  });
};

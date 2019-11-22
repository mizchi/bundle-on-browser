export async function writeToNativeFS(files: { [k: string]: string }) {
  try {
    // @ts-ignore
    const handler = await window.chooseFileSystemEntries({
      type: "saveFile",
      accepts: [
        {
          description: "json",
          extensions: ["json"],
          mimeTypes: ["application/json"]
        }
      ]
    });
    await _writeFile(handler, JSON.stringify(files));
  } catch (err) {
    alert("Please select file");
    return;
  }
}

export async function loadFromNativeFS(): Promise<{ [k: string]: string }> {
  // @ts-ignore
  const handler = await window.chooseFileSystemEntries({
    type: "openFile",
    accepts: [
      {
        description: "json", // ファイルに関する説明
        mimeTypes: ["application/json"], // 受け付けるファイルのmimeType
        extensions: ["json"] // 受け付けるファイル拡張子
      }
    ]
  });
  // await writeFile(handler, JSON.stringify(files));
  const jsonText = await _readFile(handler);
  return JSON.parse(jsonText);
}

async function _writeFile(handler: any, text: string): Promise<void> {
  const writer = await handler.createWriter();
  await writer.truncate(0);
  await writer.write(0, text);
  await writer.close();
}

async function _readFile(handler: any) {
  const file = await handler.getFile();
  const text = await file.text();
  return text;
}

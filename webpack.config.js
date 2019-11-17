const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const {GenerateSW} = require('workbox-webpack-plugin'),

// const MonacoPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  entry: {
    main: path.join(__dirname, "src/index"),
    // "ts-worker": path.join(""),
    "json.worker": "monaco-editor/esm/vs/language/json/json.worker",
    "css.worker": "monaco-editor/esm/vs/language/css/css.worker",
    "html.worker": "monaco-editor/esm/vs/language/html/html.worker",
    // "ts.worker": "monaco-editor/esm/vs/language/typescript/ts.worker",
    "ts.worker": path.join(__dirname, "src/monaco-typescript/ts.worker.ts"),
    "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js"
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].bundle.js"
  },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx"]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        ]
      }
    ]
  },
  node: {
    fs: "empty",
    module: "empty",
    dns: "empty",
    net: "empty",
    tls: "empty"
  },
  plugins: [
    GenerateSW(),
    // new MonacoPlugin(),
    new HTMLPlugin({
      template: path.join(__dirname, "src/index.html"),
      inject: false
    })
  ]
};

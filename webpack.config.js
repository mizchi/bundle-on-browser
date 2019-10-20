const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const MonacoPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
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
    new MonacoPlugin(),
    new HTMLPlugin({
      template: path.join(__dirname, "src/index.html")
    })
  ]
};

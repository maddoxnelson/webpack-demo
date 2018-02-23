const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const merge = require("webpack-merge");
const SystemBellPlugin = require("system-bell-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");

const parts = require("./webpack.parts");

const PATHS = {
  app: path.join(__dirname, "app"),
  build: path.join(__dirname, "build"),
};

const commonConfig = merge([
  {
    // Entries have to resolve to files! They rely on Node
    // convention by default so if a directory contains *index.js*,
    // it resolves to that.

    entry: {
      app: PATHS.app,
    },
    output: {
      path: PATHS.build,
      filename: "app.js",
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "Webpack demo",
      }),
      // Ignore node_modules so CPU usage with poll watching drops significantly
      new webpack.WatchIgnorePlugin([
        path.join(__dirname, "node_modules")
      ]),
      // emits a bell whenever a build fails
      new SystemBellPlugin(),
      new DashboardPlugin(),
    ],
  },
]);

const productionConfig = merge([
  parts.extractCSS({
    use: ["css-loader", parts.autoprefix()],
  })
]);

const developmentConfig = merge([
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS()
]);

module.exports = env => {
  if (env === "production") {
    return merge(commonConfig, productionConfig);
  }

  return merge(commonConfig, developmentConfig);
}

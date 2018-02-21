const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const SystemBellPlugin = require("system-bell-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");

const PATHS = {
  app: path.join(__dirname, "app"),
  build: path.join(__dirname, "build"),
};

module.exports = {
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
  devServer: {
    // Display only errors to reduce the amount of output.
    stats: "errors-only",

   // Parse host and port from env to allow customization.
   //
   // If you use Docker, Vagrant oor Cloud9, set
   // host: options.host || "0.0.0.0";
   //
   // 0.0.0.0 is available to all network devices
   // unlike default `localhost`.
   host: process.env.HOST, // Defaults to `localhost`
   port: process.env.PORT, // Defaults to 8080

   // overlay: true is equivalent
   overlay: {
     errors: true,
     warnings: true
   },
   watchOptions: {
    // Delay the rebuild after the first change
    aggregateTimeout: 300,

    // Poll using interval (in ms, accepts boolean too)
    poll: 1000,
   },
  },
};

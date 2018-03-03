const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");
const SystemBellPlugin = require("system-bell-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const glob = require("glob");
const webpack = require("webpack");

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
      filename: "[name].js",
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
    ]
  },
  parts.loadFonts({
    options: {
      name: "[name].[ext]",
    },
  }),
  parts.loadJavaScript({ include: PATHS.app }),
]);

const productionConfig = merge([
  parts.extractCSS({
    use: ["css-loader", parts.autoprefix()],
  }),
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
  }),
  parts.loadImages({
    options: {
      limit: 15000,
      name: "[name].[ext]",
    },
  }),
  parts.generateSourceMaps({ type: "source-map" }),
  parts.extractBundles([
    {
      name: "vendor",
      minChunks: ({ resource }) => /node_modules/.test(resource),
    },
  ]),
]);

const developmentConfig = merge([
  {
    output: {
      devtoolModuleFilenameTemplate:
        "webpack:///[absolute-resource-path]",
    },
  },
  parts.generateSourceMaps({
    type: "cheap-module-eval-source-map",
  }),
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages(),
]);

module.exports = env => {
  process.env.BABEL_ENV = env;
  if (env === "production") {
    return merge(commonConfig, productionConfig);
  }

  return merge(commonConfig, developmentConfig);
}

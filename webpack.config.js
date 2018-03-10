const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");
const glob = require("glob");
const webpack = require("webpack");

const parts = require("./webpack.parts");

const PATHS = {
  app: path.join(__dirname, "app"),
  build: path.join(__dirname, "build"),
};

const commonConfig = merge([
  {
    entry: {
      app: PATHS.app,
    },
    output: {
      path: PATHS.build,
      filename: "[name].js",
      pathinfo: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "Webpack demo",
      }),
      new webpack.NamedModulesPlugin(),
    ]
  },
  parts.loadFonts({
    options: {
      name: "[name].[hash:8].[ext]",
    },
  }),
  parts.loadJavaScript({ include: PATHS.app }),
]);

const productionConfig = merge([
  {
    output: {
      chunkFilename: "[name].[chunkhash:8].js",
      filename: "[name].[chunkhash:8].js",
    },
  },
  {
    performance: {
      hints: "warning", // "error" or false are valid too
      maxEntrypointSize: 50000, // in bytes, default is 250k
      maxAssetSize: 450000 // in bytes
    }
  },
  parts.clean(PATHS.build),
  parts.minifyJavascript(),
  parts.generateSourceMaps({ type: "source-map" }),
  parts.extractCSS({
    use: ["css-loader", parts.autoprefix()],
  }),
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
  }),
  parts.loadImages({
    options: {
      limit: 15000,
      name: "[name].[hash:8].[ext]",
    },
  }),
  parts.extractBundles([
    {
      name: "vendor",
      minChunks: ({ resource }) => (
        /node_modules/.test(resource),
        resource.indexOf('node_modules') >= 0 &&
        resource.match(/\.js$/)
      ),
    },
  ]),
  parts.setFreeVariable("process.env.NODE_ENV", "production"),

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

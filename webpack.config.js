const path = require("path");
const merge = require("webpack-merge");
const glob = require("glob");
const webpack = require("webpack");
const HappyPack = require("happypack");

const parts = require("./webpack.parts");

const PATHS = {
  app: path.join(__dirname, "app"),
  build: path.join(__dirname, "build"),
};

const commonConfig = merge([
  {
    output: {
      path: PATHS.build,
      filename: "[name].js",
      publicPath: "/",
    },
    plugins: [
      new webpack.NamedModulesPlugin(),
      new HappyPack({
        loaders: [
          // capture babel loader
          "babel-loader"
        ]
      })
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
    {
      name: "manifest",
      minChunks: Infinity,
    },
  ]),
  parts.setFreeVariable("process.env.NODE_ENV", "production"),
  {
    recordsPath: path.join(__dirname, "records.json"),
  },
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

  const pages = [
    parts.page({
      title: "Webpack demo",
      entry: {
        app: PATHS.app,
      },
      chunks: ["app", "manifest", "vendor"],
    }),
    parts.page({
      title: "Another demo",
      path: "another",
      entry: {
        another: path.join(PATHS.app, "another.js"),
      },
      chunks: ["app", "manifest", "vendor"],
    }),
  ];
  const config =
    env === "production" ? productionConfig : developmentConfig;

  return merge([commonConfig, config].concat(pages));
}

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const PurifyCSSPlugin = require("purifycss-webpack");

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    stats: "errors-only",
    host, // defaults to localhost
    port, // defaults to 8080
    overlay: {
      errors: true,
      warnings: true,
    }
  },
});

exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          "style-loader",
          "css-loader"
        ]
      },
    ],
  },
});

exports.extractCSS = ({ include, exclude, use }) => {
  const plugin = new ExtractTextPlugin({
    // allChunks is needed with CommonsChunkPlugin to extract
    // from extracted chunks as well.
    allChunks: true,
    filename: "app.css",
  });

  return {
    module: {
      rules: [{
        test: /\.css$/,
        include,
        exclude,

        use: plugin.extract({
          use,
          fallback: "style-loader"
        }),
      }],
    },
    plugins: [plugin],
  };
};

exports.autoprefix = () => ({
  loader: "postcss-loader",
  options: {
    plugins: () => [require("autoprefixer")()],
  },
});

exports.purifyCSS = ({ paths }) => ({
  plugins: [new PurifyCSSPlugin({ paths })],
});

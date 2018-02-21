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

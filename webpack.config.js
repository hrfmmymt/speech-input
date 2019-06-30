const path = require("path");

module.exports = {
  mode: 'production',
  entry: "./src/speech-input.mjs",
  output: {
    filename: "speech-input.min.mjs",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: ['.mjs', '.js']
  }
};

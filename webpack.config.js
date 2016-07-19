const webpack = require("webpack");

module.exports = {
  cache: true,
  entry: "./dashboard/js/main.js",
  output: {
    path: __dirname,
    filename: "./dashboard/js/build/bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel",
        query: {
          cacheDirectory: true,
          presets: ["es2015"]
        }
      },
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  }
};


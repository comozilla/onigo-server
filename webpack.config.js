const webpack = require("webpack");

module.exports = {
  cache: true,
  entry: "./js/main.js",
  output: {
    path: __dirname,
    filename: "./js/build/bundle.js"
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
  },
  resolve: {
    modulesDirectories: ["web_modules", "node_modules", "bower_components"]
  },
  plugins: [new webpack.ResolverPlugin(
    new webpack.ResolverPlugin
      .DirectoryDescriptionFilePlugin("bower.json", ["main"])
  )]
};


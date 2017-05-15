var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './libCookie/libCookie.ts', // <-- modificar aqui
  watch: true,
  devtool: 'source-map',
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js"],
  },
  module: {
    loaders: [{
      test: /\.ts$/,
      loader: 'ts-loader'
    }]
  },
  // plugins: [new webpack.optimize.UglifyJsPlugin()],
  output: {
    path: path.resolve(__dirname),
    filename: 'index.js'
  }
};

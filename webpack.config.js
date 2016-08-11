var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './vis/app.js',
  output: { path: path.resolve(__dirname, "dist"),
            publicPath: "/dist/",
            filename: 'bundle.js' },

  debug: true,
  devtool: 'eval-source-map',

  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    // Global Import for jquery
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery'
    })
  ],

  resolve: {
    alias: {
       handlebars: 'handlebars/dist/handlebars.min.js'
    }
  }
};

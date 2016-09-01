const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

const TARGET = process.env.npm_lifecycle_event;

const common = {
    entry: ['./vis/app.js'],

    output: {
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist/",
        filename: 'bundle.js'
    },

    module: {
        loaders: [{
            test: require.resolve("jquery"),
            loader: "expose?$!expose?jQuery",
        }, {
            test: /.js?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015']
            }
        }]
    },

    sassLoader: {
        includePaths: [path.resolve(__dirname, "vis/stylesheets")]
    },

    plugins: [
        // Global Import for jquery
        // new webpack.ProvidePlugin({
        //     '$': 'jquery',
        //     'jQuery': 'jquery',
        //     'window.jQuery': 'jquery'
        // })
    ],

    resolve: {
        alias: {
            handlebars: 'handlebars/dist/handlebars.js'
        }
    }
};

switch (TARGET) {
    case 'dev':
        module.exports = merge(common, {
            // Use sourcemaps
            devtool: 'eval-source-map',
            debug: true,

            module: {
                loaders: [
                    // Define development specific SASS setup
                    {
                        test: /\.scss$/,
                        loaders: ["style", "css?sourceMap", "sass?sourceMap"]
                    }, {
                        test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
                        loader: "file"
                    }
                ]
            }
        });
        break;

    case 'prod':
        module.exports = merge(common, {
            module: {
                loaders: [{
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract('css!sass')
                }, {
                    test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
                    loader: "file"
                }]
            },
            plugins: [
                new ExtractTextPlugin("style.css"),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                }),
                new CleanWebpackPlugin(['dist', 'build'], {
                    root: path.join(__dirname, 'dist'),
                    verbose: true,
                    dry: false,
                    exclude: []
                })
            ]
        });
}

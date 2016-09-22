const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const TARGET = process.env.npm_lifecycle_event;

const common = {
    devtool: 'eval-source-map',
    entry: ['./vis/app.js'],

    output: {
        path: path.resolve(__dirname, "dist"),
        // publicPath: 'dist/',
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
        }, {
            test: /\.handlebars$/,
            loader: "handlebars-loader"
        }, {
            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'url-loader?limit=10000&minetype=application/font-woff&name=assets/[name].[ext]'
        }, {
            test: /\.(ttf|eot|svg|html)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'file?name=assets/[name].[ext]'
        }, {
            test: /\.png$/,
            loader: 'file?name=img/[name].[ext]',
            exclude: /examples/
        }, {
            test: /\.(php)$/,
            loader: 'file?emitFile=false'
        }
        ]
    },

    sassLoader: {
        includePaths: [path.resolve(__dirname, "vis/stylesheets")]
    },

    plugins: [
        // new HtmlWebpackPlugin({
        //     title: 'Headstart',
        //     filename: '../examples/local_files/index.html',
        //     template: '!!handlebars!./vis/templates/index-files/index.handlebars'
        // })
    ],

    resolve: {
        alias: {
            // 
            'handlebars': 'handlebars/dist/handlebars.js',

            // paths
            'templates': path.resolve(__dirname, 'vis/templates'),
            'images':path.resolve(__dirname, 'vis/images'),
            'services': path.resolve(__dirname, 'server/services'),
            'lib': path.resolve(__dirname, 'vis/lib'),
            'styles': path.resolve(__dirname, 'vis/stylesheets'),
            'examples': path.resolve(__dirname, 'examples'),

            // modules
            'config': path.resolve(__dirname, 'vis/js/default-config.js'),
            'helpers': path.resolve(__dirname, 'vis/js/helpers.js'),
            'headstart': path.resolve(__dirname, 'vis/js/headstart.js'),
            'bubbles': path.resolve(__dirname, 'vis/js/bubbles.js'),
            'list': path.resolve(__dirname, 'vis/js/list.js'),
            'papers': path.resolve(__dirname, 'vis/js/papers.js'),
            'intro': path.resolve(__dirname, 'vis/js/intro.js'),
            'mediator': path.resolve(__dirname, 'vis/js/mediator.js'),
        },
    }
};

switch (TARGET) {
    case 'dev':
        module.exports = merge(common, {
            debug: true,

            module: {
                loaders: [
                    // Define development specific SASS setup
                    {
                        test: /\.scss$/,
                        loaders: ["style", "css?sourceMap", "sass?sourceMap"]
                    }
                ]
            }
        });
        break;

    case 'prod':
        module.exports = merge(common, {
            output: {
                publicPath: ""
            },

            module: {
                loaders: [{
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract('css!sass')
                }]
            },
            plugins: [
                new CleanWebpackPlugin(['dist'], {
                    root: path.resolve(__dirname, ""),
                    verbose: true,
                    dry: false,
                    exclude: []
                }),
                new ExtractTextPlugin("style.css"),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                })
            ]
        });
}

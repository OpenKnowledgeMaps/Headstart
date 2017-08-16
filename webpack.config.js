const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const TARGET = process.env.npm_lifecycle_event;

const common = {
    devtool: 'eval-source-map',
    entry: './vis/app.js',

    output: {
        path: path.resolve(__dirname, "dist"),
		//dev: specify a full path including protocol, production: specify full path excluding protocol
        publicPath: "http://localhost/dist/",
        filename: 'headstart.js',
        libraryTarget: 'var',
        library: 'headstart'
    },

    module: {
        loaders: [{
            test: require.resolve("jquery-dotdotdot/src/jquery.dotdotdot.min.js"),
            loader: "imports?$=jquery,jQuery=jquery"
        }, {
            test: require.resolve("hypher/dist/jquery.hypher.js"),
            loader: "imports?$=jquery,jQuery=jquery"
        }, {
            test: /lib\/*.js/,
            loader: "imports?$=jquery"
        }, {
            test: /.js?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015'],
                plugins: ['transform-object-assign']
            }
        }, {
            test: /\.handlebars$/,
            loader: "handlebars-loader",
            query: { inlineRequires: '\/images\/' }
        }, {
            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'url-loader?limit=10000&minetype=application/font-woff&name=/assets/[name].[ext]'
        }, {
            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'file?name=/assets/[name].[ext]'
        }, {
            test: /\.png$/,
            loader: 'file?name=img/[name].[ext]',
            exclude: /examples/
        }, ]
    },

    sassLoader: {
        includePaths: [path.resolve(__dirname, "vis/stylesheets")]
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            d3: "d3"
        }),
        new CleanWebpackPlugin(['dist'], {
            root: path.resolve(__dirname, ""),
            verbose: true,
            dry: false,
            exclude: []
        })
    ],

    resolve: {
        alias: {
            //
            'handlebars': 'handlebars/dist/handlebars.js',
            'dotdotdot': 'jquery-dotdotdot/src/jquery.dotdotdot.min.js',
            'hypher': 'hypher/dist/jquery.hypher.js',

            // paths
            'templates': path.resolve(__dirname, 'vis/templates'),
            'images': path.resolve(__dirname, 'vis/images'),
            'lib': path.resolve(__dirname, 'vis/lib'),
            'styles': path.resolve(__dirname, 'vis/stylesheets'),

            // modules
            'config': path.resolve(__dirname, 'vis/js/default-config.js'),
            'helpers': path.resolve(__dirname, 'vis/js/helpers.js'),
            'headstart': path.resolve(__dirname, 'vis/js/headstart.js'),
            'bubbles': path.resolve(__dirname, 'vis/js/bubbles.js'),
            'list': path.resolve(__dirname, 'vis/js/list.js'),
            'papers': path.resolve(__dirname, 'vis/js/papers.js'),
            'intro': path.resolve(__dirname, 'vis/js/intro.js'),
            'mediator': path.resolve(__dirname, 'vis/js/mediator.js'),
            'io' : path.resolve(__dirname, 'vis/js/io.js'),
            'canvas' : path.resolve(__dirname, 'vis/js/canvas.js')
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
            module: {
                loaders: [{
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract('css!sass')
                }]
            },
            plugins: [
                new ExtractTextPlugin("headstart.css"),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                })
            ]
        });
}

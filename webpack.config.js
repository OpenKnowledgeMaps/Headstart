const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const config = require('./config.js');

const TARGET = process.env.npm_lifecycle_event;

const common = {
    devtool: 'eval-source-map',
    entry: './vis/app.js',

    output: {
        path: path.resolve(__dirname, "dist"),
        //dev: specify a full path including protocol, production: specify full path excluding protocol
        publicPath: config.publicPath,
        filename: 'headstart.js',
        libraryTarget: 'var',
        library: 'headstart'
    },

    module: {
        rules: [
            {
                test: require.resolve("jquery-dotdotdot/src/jquery.dotdotdot.min.js"),
                use: [
                    { loader: "imports-loader?$=jquery,jQuery=jquery" }
                ]
            }, {
                test: require.resolve("hypher/dist/jquery.hypher.js"),
                use: [
                    { loader: "imports-loader?$=jquery,jQuery=jquery" }
                ]
            }, {
                test: /lib\/*.js/,
                use: [
                    { loader: "imports-loader?$=jquery" }
                ]
            }, {
                test: /.js?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                ]
            }, {
                test: /\.handlebars$/,
                use: [
                    {
                        loader: "handlebars-loader",
                        options: {
                            query: { inlineRequires: '\/images\/' }
                        }
                    }
                ]
            }, {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    { loader: 'url-loader?limit=10000&minetype=application/font-woff&name=/assets/[name].[ext]' }
                ]
            }, {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    { loader: 'file-loader?name=/assets/[name].[ext]' }
                ]
            }, {
                test: /\.png$/,
                use: [
                    {
                        loader: 'file-loader?name=img/[name].[ext]',
                        options: { exclude: /examples/ }
                    }
                ]
            },
        ]
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
            'styles': path.resolve(__dirname, 'vis/stylesheets/'),

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
            'canvas' : path.resolve(__dirname, 'vis/js/canvas.js'),
            'streamgraph' : path.resolve(__dirname, 'vis/js/streamgraph.js')
        },
    },
    
    externals: {
        'chart': 'Chart'
    }
};
switch (TARGET) {
    case 'dev':
        common.module.rules.push(
                {
                    test: /\.scss$/,
                    use: [ { loader: "style-loader"}, { loader: "css-loader?sourceMap"},
                        {
                            loader: "sass-loader",
                            options: {
                                includePaths: ["vis/stylesheets"],
                                data:  '$skin: "' + config.skin + '";',
                                sourceMap: true
                            }
                        }
                    ]
                }

        );
        module.exports = common;
        break;

    case 'prod':
        common.module.rules.push(
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract('css-loader!sass-loader?data=$skin: "' + config.skin + '";')
            }
        );
        common.plugins.push(
                new ExtractTextPlugin("headstart.css"),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                })
        );
        module.exports = common
}

var config = require('./config.js');
const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const TARGET = process.env.npm_lifecycle_event;

const common = {
    mode: "development",
    devtool: 'eval-source-map',
    entry: './vis/app.js',

    output: {
        path: path.resolve(__dirname, "dist"),
	//dev: specify a full path including protocol, production: specify full path excluding protocol
        publicPath: config.publicPath,
        filename: 'entrypoint.js',
        libraryTarget: 'var',
        library: 'headstart'
    },

    devServer: {
        contentBase: path.join( __dirname ),
        compress: true,
        port: 8080,
        disableHostCheck: true,
        host: '0.0.0.0',
        publicPath: '/dist/'
    },

    resolve: {
        alias: {
            //
            'handlebars': 'handlebars/dist/handlebars.js',
            'dotdotdot': path.resolve(__dirname, 'vis/lib/jquery.dotdotdot.min.js'),
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
            'canvas' : path.resolve(__dirname, 'vis/js/canvas.js'),
            'streamgraph' : path.resolve(__dirname, 'vis/js/streamgraph.js')
        },
    },
    
    externals: {
        'chart': 'Chart'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            d3: "d3"
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: 'headstart.css',
            chunkFilename: '[id].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
          }),
    ],
    module: {
        rules: [
            {
                test: require.resolve(path.resolve(__dirname, 'vis/lib/jquery.dotdotdot.min.js')),
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
                    },
                ]
            }, {
                      test: /\.(sa|sc|c)ss$/,
                      use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                              hmr: process.env.NODE_ENV === 'development',
                            },
                          },
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                prependData: '$skin: "' + config.skin + '";'
                            }
                        },
                      ],
                    },

        ]
    }
};

module.exports = common

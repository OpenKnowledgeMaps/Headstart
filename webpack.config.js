var config = require('./config.js');
const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const TARGET = process.env.npm_lifecycle_event;

const common = {
    devtool: 'eval-source-map',
    entry: './vis/entrypoint.js',

    output: {
        path: path.resolve(__dirname, "dist"),
	//dev: specify a full path including protocol, production: specify full path excluding protocol
        publicPath: config.publicPath,
        filename: 'headstart.js',
        libraryTarget: 'var',
        library: 'headstart'
    },

    devServer: {
        contentBase: path.join( __dirname ),
        compress: true,
        disableHostCheck: true,
        host: '0.0.0.0',
        publicPath: '/dist/'
    },

    resolve: {
        alias: {
            //
            'handlebars': 'handlebars/dist/handlebars.js',
            'hypher': 'hypher/dist/jquery.hypher.js',
            'markjs': 'mark.js/dist/jquery.mark.js',

            // paths
            'templates': path.resolve(__dirname, 'vis/templates'),
            'images': path.resolve(__dirname, 'vis/images'),
            'lib': path.resolve(__dirname, 'vis/lib'),
            'styles': path.resolve(__dirname, 'vis/stylesheets'),

            // modules
            'config': path.resolve(__dirname, 'vis/js/default-config.js'),
            'headstart': path.resolve(__dirname, 'vis/js/headstart.js'),
            'intro': path.resolve(__dirname, 'vis/js/intro.js'),
            'mediator': path.resolve(__dirname, 'vis/js/mediator.js'),
            'io' : path.resolve(__dirname, 'vis/js/io.js'),
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
          new webpack.EnvironmentPlugin({
            MODERN_FRONTEND: typeof config.modernFrontendEnabled === "boolean" ? config.modernFrontendEnabled : false
          })
    ],
    module: {
        rules: [
            {
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
                test: /.jsx?$/,
                resolve: { extensions: [".js", ".jsx"] },
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react']
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
                use: [{
                  loader: 'style-loader',
                }, {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    hmr: process.env.NODE_ENV === 'development',
                    },
                }, {
                  loader: 'css-loader',
                }, {
                  loader: 'sass-loader',
                  options: {
                    prependData: `
                        $skin: "${config.skin}";
                        $modern_frontend_enabled: ${process.env.MODERN_FRONTEND ? "true" : "false"};
                    `,
                    sassOptions: {
                      includePaths: ["node_modules"]
                    }
                  }
                },
              ],
            },

        ]
    }
};

module.exports = common

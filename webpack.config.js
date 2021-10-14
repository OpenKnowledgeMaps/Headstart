var config = require('./config.js');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

//const TARGET = process.env.npm_lifecycle_event;

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
        static: { directory: path.join( __dirname ) },
        allowedHosts: "all",
        host: "0.0.0.0",
        devMiddleware: { publicPath: '/dist/' }
    },

    resolve: {
        alias: {
            //
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
            'mediator': path.resolve(__dirname, 'vis/js/mediator.js'),
            'io' : path.resolve(__dirname, 'vis/js/io.js'),

            // building
            process: "process/browser",
        },
    },

    externals: {
        'chart': 'Chart'
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: 'headstart.css',
            chunkFilename: '[id].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
        // can be used for simulating env variables
        new webpack.EnvironmentPlugin({})
    ],
    module: {
        rules: [
            {
                test: require.resolve("hypher/dist/jquery.hypher.js"),
                use: [
                    { 
                        loader: "imports-loader", 
                        options: {
                            imports: [
                                "default jquery $",
                                "default jquery jQuery"
                            ]
                        }
                    }
                ]
            }, {
                test: /lib\/*.js/,
                use: [
                    { 
                        loader: "imports-loader", 
                        options: {
                            imports: [
                                "default jquery $",
                                "default jquery jQuery"
                            ]
                        }
                    }
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
                  options: { esModule: false },
                }, {
                  loader: 'css-loader',
                }, {
                  loader: 'sass-loader',
                  options: {
                    additionalData: `
                        $skin: "${config.skin}";
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

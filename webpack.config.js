var config = require("./config.js");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

//const TARGET = process.env.npm_lifecycle_event;

const getSkinExample = (skin) => {
  switch (skin) {
    case "":
      return ["/project_website/base.html"];
    case "covis":
      return ["/local_covis/"];
    case "triple":
      return ["/local_triple/map.html"];
    case "viper":
      return "/local_viper/";
    default:
      return false;
  }
};

module.exports = (env) => {
  const { publicPath, skin, analyzeBundle } = { ...config, ...env };

  return {
    devtool: "eval-source-map",
    entry: {
      headstart: "./vis/entrypoint.js",
    },

    output: {
      filename: "[name].[contenthash].bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
      // dev: specify a full path including protocol
      // production: specify full path excluding protocol
      publicPath: publicPath,
      library: {
        name: "headstart",
        type: "var",
      },
    },

    devServer: {
      open: getSkinExample(skin),
      static: {
        directory: path.resolve(__dirname, "examples/"),
      },
      allowedHosts: "all",
      devMiddleware: { publicPath: "/dist/" },
    },

    resolve: {
      alias: {
        //
        hypher: "hypher/dist/jquery.hypher.js",
        markjs: "mark.js/dist/jquery.mark.js",

        // paths
        templates: path.resolve(__dirname, "vis/templates"),
        images: path.resolve(__dirname, "vis/images"),
        lib: path.resolve(__dirname, "vis/lib"),
        styles: path.resolve(__dirname, "vis/stylesheets"),

        // modules
        config: path.resolve(__dirname, "vis/js/default-config.js"),
        headstart: path.resolve(__dirname, "vis/js/headstart.js"),
        mediator: path.resolve(__dirname, "vis/js/mediator.js"),
        io: path.resolve(__dirname, "vis/js/io.js"),

        // building
        process: "process/browser",
      },
    },

    externals: {
      chart: "Chart",
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        filename: "headstart.php",
        templateContent: ({ htmlWebpackPlugin }) =>
          `${htmlWebpackPlugin.tags.headTags}
          ${htmlWebpackPlugin.tags.bodyTags}`,
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
      }),
      // can be used for simulating env variables
      new webpack.EnvironmentPlugin({}),
      ...(analyzeBundle ? [new BundleAnalyzerPlugin()] : []),
    ],
    module: {
      rules: [
        {
          test: require.resolve("hypher/dist/jquery.hypher.js"),
          use: [
            {
              loader: "imports-loader",
              options: {
                imports: ["default jquery $", "default jquery jQuery"],
              },
            },
          ],
        },
        {
          test: /lib\/*.js/,
          use: [
            {
              loader: "imports-loader",
              options: {
                imports: ["default jquery $", "default jquery jQuery"],
              },
            },
          ],
        },
        {
          test: /.jsx?$/,
          resolve: { extensions: [".js", ".jsx"] },
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env", "@babel/preset-react"],
              },
            },
          ],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: "asset/resource",
        },
        {
          test: /\.png$/,
          use: [
            {
              loader: "file-loader?name=img/[name].[ext]",
              options: { exclude: /examples/ },
            },
          ],
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: MiniCssExtractPlugin.loader,
              options: { esModule: false },
            },
            {
              loader: "css-loader",
            },
            {
              loader: "sass-loader",
              options: {
                additionalData: `
                        $skin: "${skin}";
                    `,
                sassOptions: {
                  includePaths: ["node_modules"],
                },
              },
            },
          ],
        },
        { test: /\.csl$/, type: "asset/source" },
      ],
    },
    optimization: {
      // deterministic = stable hashes between builds
      moduleIds: "deterministic",
      // single = optimized for import into same page
      runtimeChunk: "single",
      splitChunks: {
        // max chunk size in B
        maxSize: 500000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
  };
};

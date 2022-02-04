var config = require("./config.js");
const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
  const { publicPath, skin } = { ...config, ...env };

  return {
    devtool: "eval-source-map",
    entry: "./vis/entrypoint.js",

    output: {
      path: path.resolve(__dirname, "dist"),
      //dev: specify a full path including protocol, production: specify full path excluding protocol
      publicPath: publicPath,
      filename: "headstart.js",
      libraryTarget: "var",
      library: "headstart",
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
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // all options are optional
        filename: "headstart.css",
        chunkFilename: "[id].css",
        ignoreOrder: false, // Enable to remove warnings about conflicting order
      }),
      // can be used for simulating env variables
      new webpack.EnvironmentPlugin({}),
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
  };
};

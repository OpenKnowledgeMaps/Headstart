const path = require("path");

const { ProvidePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const config = require("./config.js");

module.exports = (env) => {
  let { publicPath, skin } = { ...config, ...env };
  const { analyzeBundle, example } = { ...config, ...env };

  // output filename: deployment config
  let outputFilename = "[name].[contenthash].bundle.js";

  // HtmlWebpackPlugin: deployment config
  let htmlConfig = {
    inject: false,
    filename: "headstart.php",
    templateContent: ({ htmlWebpackPlugin }) =>
      `${htmlWebpackPlugin.tags.headTags}
      ${htmlWebpackPlugin.tags.bodyTags}`,
  };

  // MiniCssExtractPlugin: deployment config
  const miniCssConfig = {
    filename: "[name].[contenthash].css",
  };

  // local examples config overrides
  const exampleConfig = getExampleConfig(example);
  if (exampleConfig) {
    publicPath = "http://localhost:8080/dist/";
    skin = exampleConfig.skin;

    outputFilename = "[name].bundle.js";

    // HtmlWebpackPlugin
    htmlConfig = {
      template: exampleConfig.template,
    };

    // MiniCssExtractPlugin
    miniCssConfig.filename = "[name].css";
  }

  return {
    devtool: "eval-source-map",

    entry: {
      headstart: "./vis/index.ts",
    },

    output: {
      filename: outputFilename,
      path: path.resolve(__dirname, "dist"),
      publicPath: publicPath,
      library: {
        name: "headstart",
        type: "var",
      },
      clean: true,
    },

    devServer: {
      open: true,
      static: [
        path.resolve(__dirname, "dist/"),
        path.resolve(__dirname, "examples/public/"),
      ],
      devMiddleware: { publicPath: "/dist/", writeToDisk: true },
    },

    resolve: {
      extensions: [".*", ".js", ".jsx", ".ts", ".tsx"],
      alias: {
        //
        hypher: "hypher/dist/jquery.hypher.js",
        markjs: "mark.js/dist/jquery.mark.js",

        // paths
        images: path.resolve(__dirname, "vis/images"),
        lib: path.resolve(__dirname, "vis/lib"),
        styles: path.resolve(__dirname, "vis/stylesheets"),

        // modules
        config: path.resolve(__dirname, "vis/js/default-config.js"),
        headstart: path.resolve(__dirname, "vis/js/headstart.js"),
        mediator: path.resolve(__dirname, "vis/js/mediator.js"),

        // building
        process: "process/browser",
      },
    },

    plugins: [
      new HtmlWebpackPlugin(htmlConfig),
      new ProvidePlugin({
        process: "process/browser",
        jQuery: "jquery",
      }),
      new MiniCssExtractPlugin(miniCssConfig),
      ...(analyzeBundle ? [new BundleAnalyzerPlugin()] : []),
    ],

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: [require.resolve("hypher/dist/jquery.hypher.js"), /lib\/*.js/],
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
          test: /\.[j]sx?$/,
          exclude: /node_modules/,
          use: "babel-loader",
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
          test: /\.(sa|sc)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                additionalData: `$skin: "${skin}";`,
                sassOptions: {
                  includePaths: ["node_modules"],
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
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

const getExampleConfig = (example) => {
  switch (example) {
    case "base":
      return {
        skin: "",
        template: "examples/templates/base.html",
      };
    case "pubmed":
      return {
        skin: "",
        template: "examples/templates/pubmed.html",
      };
    case "triple":
      return {
        skin: "triple",
        template: "examples/templates/triple.html",
      };
    default:
      return null;
  }
};

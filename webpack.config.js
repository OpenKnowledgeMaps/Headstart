const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
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
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      alias: {
        // Aliases for the root frontend folder (vis) and the folder where
        // code of components is mostly located (vis/js)
        "@": path.resolve(__dirname, "vis/"),
        "@js": path.resolve(__dirname, "vis/js/"),

        // Aliases for hypher and markjs are created for more convenient
        // import of them from the node_modules/ folder
        hypher: "hypher/dist/jquery.hypher.js",
        markjs: "mark.js/dist/jquery.mark.js",
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
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "node_modules/leaflet/dist/images"),
            to: "images",
          },
        ],
      }),
    ],

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.[j]sx?$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
          },
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: "asset/resource",
          generator: {
            filename: "images/[name][ext]",
          },
        },
        {
          test: /\.(sa|sc)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                url: true,
                esModule: false,
              },
            },
            {
              loader: "sass-loader",
              options: {
                additionalData: `$skin: "${process.env.SKIN || ""}";`,
                sassOptions: {
                  includePaths: ["node_modules"],
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: { url: true, esModule: false },
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
    case "viper":
      return {
        skin: "viper",
        template: "examples/templates/viper.html",
      };
    case "covis":
      return {
        skin: "covis",
        template: "examples/templates/covis.html",
      };
    default:
      return null;
  }
};

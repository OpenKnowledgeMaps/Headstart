module.exports = {
  presets: [
    "@babel/preset-react",
    ["@babel/preset-env", { 
      targets: { node: "current" },
      modules: "commonjs",
    }],
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        regenerator: true,
      },
    ],
  ],
};

export default [
  {
    parser: "@babel/eslint-parser",
    parserOptions: {
      requireConfigFile: false,
      babelOptions: {
        presets: ["@babel/preset-react"],
      },
      ecmaFeatures: {
        jsx: true,
      },
    },
    extends: ["eslint:recommended", "plugin:react/recommended"],
    plugins: ["react", "react-hooks"],
    rules: {
      // we don't use prop-types
      "react/prop-types": 0,
      // this would throw an error e.g. for quotes ('')
      "react/no-unescaped-entities": 0,
      // in callbacks it's handy to leave unused function parameters
      "no-unused-vars": ["error", { args: "none" }],
    },
    env: {
      browser: true,
      node: true,
      es6: true,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];

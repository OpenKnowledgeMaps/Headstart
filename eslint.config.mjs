import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: process.cwd(), // Ensure ESLint knows where to find the configuration
  recommendedConfig: {
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
  },
});

export default [
  ...compat.config({
    extends: ["eslint:recommended", "plugin:react/recommended"],
    plugins: ["react", "react-hooks"],
    rules: {
      "react/prop-types": 0,
      "react/no-unescaped-entities": 0,
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
  }),
];
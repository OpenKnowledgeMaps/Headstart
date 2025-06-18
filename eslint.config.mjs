import js from "@eslint/js";
import parserBabel from "@babel/eslint-parser";
import parserTs from "@typescript-eslint/parser";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginTs from "@typescript-eslint/eslint-plugin";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";

/** @type {import("eslint").FlatConfig[]} */
export default [
  js.configs.recommended,

  // TypeScript files
  {
    files: ["vis/**/*.{ts,tsx}"],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: true,
      },
    },
    plugins: {
      "@typescript-eslint": pluginTs,
      "react": pluginReact,
      "react-hooks": pluginReactHooks,
      "simple-import-sort": pluginSimpleImportSort,
    },
    rules: {
      ...pluginTs.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
      "prefer-const": "warn",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "array-callback-return": "error",
      "consistent-return": "off",
      "default-param-last": "error",
      "eqeqeq": ["error", "always"],
      "no-console": "warn",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-param-reassign": ["error", { props: true }],
      "prefer-template": "error",
      "react/jsx-filename-extension": [
        "warn",
        { extensions: [".jsx", ".tsx"] },
      ],
      "react/jsx-props-no-spreading": "off",
      "react/react-in-jsx-scope": "off",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // JavaScript files
  {
    files: ["vis/**/*.{js,jsx}"],
    languageOptions: {
      parser: parserBabel,
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
    plugins: {
      "react": pluginReact,
      "react-hooks": pluginReactHooks,
      "simple-import-sort": pluginSimpleImportSort,
    },
    rules: {
      "no-unused-vars": ["error", { args: "none" }],
      "prefer-const": "warn",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "array-callback-return": "error",
      "consistent-return": "off",
      "default-param-last": "error",
      "eqeqeq": ["error", "always"],
      "no-console": "warn",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-param-reassign": ["error", { props: true }],
      "prefer-template": "error",
      "react/jsx-filename-extension": [
        "warn",
        { extensions: [".jsx", ".tsx"] },
      ],
      "react/jsx-props-no-spreading": "off",
      "react/react-in-jsx-scope": "off",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];

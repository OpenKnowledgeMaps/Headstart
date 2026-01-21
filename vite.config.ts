import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import inject from "@rollup/plugin-inject";

export default defineConfig({
  plugins: [
    react(),
    inject({
      $: ["jquery", "*"],
      jQuery: "jquery",
    }),
  ],
  assetsInclude: ["**/*.csl"],

  resolve: {
    alias: {
      "@": "/vis/",
      "@js": "/vis/js/",

      "lib": "/vis/lib",
      "markjs": "mark.js/dist/jquery.mark.js",
      // hypher: "hypher/dist/jquery.hypher.js",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vis/test/setupTests.js",
  },
});

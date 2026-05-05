import { defineConfig } from "eslint/config";

import { baseConfig } from "@repo/eslint-config/base";
import { reactConfig } from "@repo/eslint-config/react";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  {
    languageOptions: {
      globals: {
        console: "readonly",
        document: "readonly",
        process: "readonly",
        window: "readonly",
      },
    },
  },
  baseConfig,
  reactConfig,
  {
    files: ["server.js"],
    rules: {
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },
  {
    files: ["src/routes/**/*.tsx", "src/server/route-params.ts"],
    rules: {
      "@typescript-eslint/only-throw-error": "off",
    },
  },
);

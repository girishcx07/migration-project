import { defineConfig } from "tsup"

export default defineConfig({
  entry: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.test.*",
    "!src/**/*.spec.*",
  ],
  format: ["esm"],
  target: "es2019",
  dts: false,
  clean: true,
  sourcemap: false,
  splitting: false,
  treeshake: true,
  minify: false,
  external: [
    /^@workspace\/ui/,
    /^@workspace\/orpc/,
    /^@workspace\/types/,
    /^@workspace\/common/,
    "react",
    "react-dom",
  ],
})

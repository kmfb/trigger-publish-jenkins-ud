// rollup.config.mjs
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "out/index.js",
    format: "cjs",
  },
  plugins: [typescript()],
};

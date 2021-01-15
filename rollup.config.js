import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

export default {
  input: "src/main.ts",
  output: [
    {
      file: "dist/sliding-puzzle-umd.js",
      format: "umd",
      name: "SlidingPuzzle",
    },
    {
      file: "dist/sliding-puzzle-cjs.js",
      format: "cjs",
    },
    {
      file: "dist/sliding-puzzle-esm.js",
      format: "esm",
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: require("typescript"),
    }),
  ],
};

import { terser } from "rollup-plugin-terser";

export default {
  input: "./src/index.js",
  output: {
    file: "./bin/index.js",
    banner: "#!/usr/bin/env node",
  },
  plugins: [terser()],
};

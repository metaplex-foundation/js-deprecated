import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const input = "src/index.ts";
const name = "Metaplex";

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const plugins = [
  resolve({
    preferBuiltins: true,
  }),
  typescript({
    rollupCommonJSResolveHack: true,
    exclude: ["**/__tests__/**"],
  }),
  commonjs({
    include: /node_modules/,
  }),
  terser(),
];

const pluginsBrowser = [
  resolve({
    browser: true,
    preferBuiltins: false,
    mainFields: ['browser']
  }),
  typescript({
    rollupCommonJSResolveHack: true,
    exclude: ["**/__tests__/**"],
  }),
  commonjs({
    include: /node_modules/,
  }),
  terser(),
];

const OUTPUT_DATA = [
  {
    file: pkg.main,
    format: "cjs",
    plugins,
  },
  {
    file: pkg.module,
    format: "es",
    plugins,
  },
  {
    file: pkg.browser['dist/index.js'],
    format: "cjs",
    plugins: pluginsBrowser,
  },
  {
    file: pkg.browser['dist/index.es.js'],
    format: "es",
    plugins: pluginsBrowser,
  },
];

const config = OUTPUT_DATA.map(({ file, format, plugins }) => ({
  input,
  output: {
    file,
    format,
    exports: "named",
    sourcemap: true,
    name,
  },
  external,
  plugins,
}));

export default config;

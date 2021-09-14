import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

const input = 'src/index.ts';
const name = 'Metaplex';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const plugins = [
  alias({
    // This addresses this issue and can be removed when it is resolved:
    // https://github.com/node-fetch/fetch-blob/issues/117
    entries: [{ find: 'stream/web', replacement: 'web-streams-polyfill/dist/ponyfill.es2018.js' }],
  }),
  resolve({
    preferBuiltins: true,
  }),
  typescript({
    rollupCommonJSResolveHack: true,
    exclude: ['**/*.test.ts'],
  }),
  replace({ 'process.browser': !!process.env.BROWSER, preventAssignment: true }),
  commonjs({
    include: /node_modules/,
  }),
];

const pluginsBrowser = [
  alias({
    entries: [{ find: /isomorphic$/, replacement: 'isomorphic/index.browser' }],
  }),
  resolve({
    browser: true,
    preferBuiltins: false,
    mainFields: ['browser'],
  }),
  typescript({
    rollupCommonJSResolveHack: true,
    exclude: ['**/*.test.ts'],
  }),
  replace({ 'process.browser': !!process.env.BROWSER, preventAssignment: true }),
  commonjs({
    include: /node_modules/,
  }),
  terser(),
];

const OUTPUT_DATA = [
  {
    file: pkg.module,
    format: 'es',
    plugins,
  },
  {
    file: pkg.browser,
    format: 'es',
    plugins: pluginsBrowser,
  },
];

const config = OUTPUT_DATA.map(({ file, format, plugins }) => ({
  input,
  output: {
    file,
    format,
    exports: 'named',
    sourcemap: true,
    name,
  },
  external,
  plugins,
}));

export default config;

import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
// import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const plugins = ({ browser = false }) => [
  typescript({
    tsconfig: 'tsconfig.build.json',
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
        declarationMap: false,
        module: 'ES2015',
      },
    },
  }),
  resolve({
    browser,
    dedupe: ['bn.js', 'buffer'],
    preferBuiltins: !browser,
  }),
  commonjs(),
  json(),
];
const terserPlugin = terser();

const bundle = {
  input: 'src/index.ts',
  output: {
    format: 'iife',
    name: 'metaplex',
    sourcemap: true,
    globals: {
      '@solana/web3.js': 'solanaWeb3',
      '@solana/spl-token': 'splToken',
      crypto: 'crypto',
    },
  },
  context: 'window',
  external: ['@solana/web3.js', '@solana/spl-token', 'crypto'],
};

export default [
  {
    ...bundle,
    output: {
      ...bundle.output,
      file: 'build/metaplex.js',
    },
    plugins: plugins({ browser: true }),
  },
  // Min
  {
    ...bundle,
    output: {
      ...bundle.output,
      file: 'build/metaplex.min.js',
    },
    plugins: [...plugins({ browser: true }), terserPlugin],
  },
];

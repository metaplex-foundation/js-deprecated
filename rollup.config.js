import typescript from 'rollup-plugin-typescript2';
import ttypescript from 'ttypescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import multiInput from 'rollup-plugin-multi-input';
import { visualizer } from 'rollup-plugin-visualizer';
import { terser } from 'rollup-plugin-terser';

const input = ['src/actions/*.ts', 'src/programs/**/*.ts', 'src/index.ts'];

const plugins = ({ browser }) => [
  typescript({
    typescript: ttypescript,
    tsconfig: 'tsconfig.build.json',
    tsconfigOverride: {
      compilerOptions: {
        declaration: true,
        module: 'ES2015',
      },
    },
  }),
  resolve({
    browser,
    dedupe: ['bn.js', 'buffer', 'crypto-hash'],
    preferBuiltins: !browser,
  }),
  commonjs(),
  json(),
  multiInput({ relative: 'src/' }),
];

const config = ({ browser, format } = { browser: false }) => {
  const config = {
    input,
    plugins: plugins({ browser }),
    // Default external, can be overrided
    external: [
      '@solana/spl-token',
      '@solana/web3.js',
      '@types/bs58',
      'axios',
      'bn.js',
      'borsh',
      'bs58',
      'buffer',
      'crypto-hash',
    ],
  };

  config.output = [
    {
      dir: 'lib',
      format: 'es',
      sourcemap: true,
    },
  ];

  return config;
};

export default [
  // Node
  config(),
  // Browser
  // config({ browser: true, format: 'esm' }),
  // config({ browser: true, format: 'iife' }),
];

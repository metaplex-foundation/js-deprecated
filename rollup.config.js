import typescript from 'rollup-plugin-typescript2';
import ttypescript from 'ttypescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { visualizer } from 'rollup-plugin-visualizer';
import { terser } from 'rollup-plugin-terser';

const input = 'src/index.ts';

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

  if (browser) {
    switch (format) {
      case 'esm':
        config.output = {
          file: 'lib/index.browser.esm.js',
          format: 'es',
          sourcemap: true,
        };
        break;
      case 'iife':
        const base = {
          format: 'iife',
          name: 'metaplex',
          sourcemap: true,
          globals: {
            '@solana/web3.js': 'solanaWeb3',
            '@solana/spl-token': 'splToken',
          },
        };
        config.output = [
          {
            ...base,
            file: 'lib/index.iife.js',
          },
          {
            ...base,
            file: 'lib/index.iife.min.js',
            plugins: [terser(), visualizer()],
          },
        ];
        config.context = 'window';
        config.external = ['@solana/web3.js', '@solana/spl-token'];
        break;
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  } else {
    config.output = [
      {
        file: 'lib/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'lib/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ];
  }

  return config;
};

export default [
  // Node
  config(),
  // Browser
  config({ browser: true, format: 'esm' }),
  config({ browser: true, format: 'iife' }),
];

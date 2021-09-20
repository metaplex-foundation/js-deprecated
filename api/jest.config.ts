import { pathsToModuleNameMapper } from 'ts-jest/utils';

const paths = {
  '@metaplex/utils': ['./src/utils'],
  '@metaplex/types': ['./src/types'],
  '@metaplex/errors': ['./src/errors'],
};

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.(spec|test).ts'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      diagnostics: false,
    },
  },
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
};

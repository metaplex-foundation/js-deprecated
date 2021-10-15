import { pathsToModuleNameMapper } from 'ts-jest/utils';

const paths = {
  '@metaplex/utils': ['./api/src/utils'],
  '@metaplex/types': ['./api/src/types'],
  '@metaplex/errors': ['./api/src/errors'],
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

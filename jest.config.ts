export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/*.(spec|test).ts', '**/test/*.ts'],
  transform: {},
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
      diagnostics: false,
      useESM: true,
    },
  },
};

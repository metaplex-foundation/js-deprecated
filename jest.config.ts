export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.(spec|test).ts', '**/test/*.ts'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
      diagnostics: false,
    },
  },
}

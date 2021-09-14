// This allows us to conditionally export environment aware modules via rollup
// and not get yelled at by TypeScript at the same time
declare namespace NodeJS {
  interface Process {
    browser: boolean;
  }
}


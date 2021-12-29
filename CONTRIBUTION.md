# How to Contribute
This project uses the latest version of Yarn in `node_modules` mode which means you get great and fast package management but the same package.json file setup like you are used to. In order to build this project or test it see the package.json for all the possible scripts you can run. Generally the dev flow is this:

```
// Install deps
yarn 
//Make your changes and link
yarn fix
// Test your code
yarn test
// build it 
yarn build
//Create a PR
```

### (Optional) Contributing To Low Level Contract SDKS
The metaplex JS SDK is a high level tool to accomplish specific actions and compose those actions to create NFT experiences on the web. It Is made up of many small contract specific packages which are tightly coupled to the actual Smart Contracts they implement. These packages are generated from rust source code mostly and are instruction specific. They live in https://github.com/metaplex-foundation/metaplex-program-library and are published on NPM here https://www.npmjs.com/search?q=%40metaplex-foundation. When developing features and fixes for the JS SDK you may need to contribute to these low level packages as well, but most of the time you wont have too. The following is a guide on how to get your development environment setup for local contribution to both repos.

Within the same parent folder pull both JS SDK and the MPL repos like this:

```
git clone git@github.com:metaplex-foundation/js.git
git clone git@github.com:metaplex-foundation/metaplex-program-library.git
```

Then jump into the js repo and run the local setup script like this: 

```
cd js
yarn 
yarn run link-mpl
```

Now in your `node_modules` folder those packages come from your local folder copy so you can change branches in `metaplex-program-library` and build as you want and the changes will be reflected. Note that since the JS SDK uses the build version of the MPL SDKs you will need to make your changes in the mpl package and then build them. All packages in MPL support `yarn build` and `lerna build` see https://github.com/metaplex-foundation/metaplex-program-library for more details on this.
## Pull Requests

1. Fork the Metaplex JS repository
2. Create a new branch for each feature, fix or improvement
3. Send a pull request from each feature branch to the **main** branch

## Style Guide

All pull requests SHOULD adhere to the [Conventional Commits specification](https://conventionalcommits.org/). Semantic-release uses that specification to determine the type of release.

* fix: use proper key on WhitelistedCreator will bump the version to 1.0.1
* feat: implement ArweaveStorage provider will bump the version to 1.1.0
* BREAKING CHANGE: rewrite Metaplex.init will bump the version to 2.0.0
* feat!: rewrite Metaplex.init will bump the version to 2.0.0
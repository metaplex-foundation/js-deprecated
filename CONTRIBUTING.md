# Contributing to the Metaplex JS SDK

Thank you for your interest in contributing to the Metaplex JS SDK. In this doc you'll find an overview of the contribution workflow.

## Contribution Guide

### Reporting new issues

If you find a bug or have an idea for a new feature, [open an Issue
here](https://github.com/metaplex/js/issues), following the instructions to
ensure the issue is triaged properly.

### Working on existing issues

Search through the [currently open issues](https://github.com/metaplex-foundation/js/issues) for something you find interesting.
If you're new to this project you might also [filter by the "good first issue"
label](https://github.com/metaplex/js/issues?q=is%3Aopen+is%3Aissue+label%3A"good+first+issue"). Issues that are not yet assigned are free to tackle!

### Contributing code changes

This project uses the latest version of [yarn][] in `node_modules` mode which means
you get great and fast package management but the same `package.json` file setup
like you are used to. In order to build this project or test it see the
`package.json` for all the possible scripts you can run. Generally the dev flow is
this:

```
// Clone the repo
git clone git@github.com:metaplex-foundation/js.git

// Install deps
yarn

// Make your changes

// Fix lint issues
yarn fix

// Test your code
yarn test

// Build it
yarn build

// Commit your changes
```

#### Commit Message Style Guide

All commit messages and Pull Request titles SHOULD adhere to the [Conventional Commits
specification](https://conventionalcommits.org/). Our auto-release tooling uses this
specification to determine the type of release to make.

For example, if the current version of the package was 1.0.0:

|Example message|Result|
|----------------------|-----|
|fix: use proper key on WhitelistedCreator| bump the version to 1.0.1|
|feat: implement ArweaveStorage provider |bump the version to 1.1.0|
|BREAKING CHANGE: rewrite Metaplex.init |bump the version to 2.0.0|
|feat!: rewrite Metaplex.init |bump the version to 2.0.0|


When you're finished with the changes, create a pull request, also known as a PR.
- First, self-review your own changes before opening a PR. This speeds up the review process by spotting potential issues locally.
- Now open the PR, filling out the information requested in the Github UI. Use the Commit Message Style Guide above to format your PR title.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge.
Once you submit your PR, a foundation member will review your proposal. We may ask questions or request additional information.
- We may ask for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
- As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).

Once your PR is merged, it will be publicly visible in the repository! Congrats! :tada::tada: You are now an official contributor to [Metaplex][] :sunglasses:.

## (Optional) Contributing To Low Level Contract SDKs

The Metaplex JS SDK is a high level tool to accomplish specific actions and
compose those actions to create NFT experiences on the web. It is made up of
small contract specific packages which are tightly coupled to the actual
Smart Contracts they implement. These packages are mostly generated from rust source
code and are instruction specific. They live in
https://github.com/metaplex-foundation/metaplex-program-library and are
published on NPM here https://www.npmjs.com/search?q=%40metaplex-foundation.
When developing features and fixes for the JS SDK you may need to contribute to
these low level packages as well, but most of the time you won't have too. The
following is a guide on how to get your development environment setup for local
contribution to both repos.

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

Your local `metaplex-program-library` (MPL) JS packages are now linked to your
JS SDK.  You can change branches in MPL and re-build to see the changes
reflected in the SDK.  All packages in MPL support `yarn build` and `lerna
build` see https://github.com/metaplex-foundation/metaplex-program-library for
more details.

Additionally, if you need to make rust changes to the `metaplex-program-library`
and test them out in the JS SDK, run the following package scripts to get your
changes running in your local CI:

```
yarn run test:all-local-mpl
```

This command will (re)build your local `metaplex-program-library` rust contracts
and (re)start a local `solana-test-validator` with them pre-loaded, which the JS
SDK CI integration tests will use automatically. Now you can debug the entire
end-to-end flow locally!

[yarn]: https://yarnpkg.com/
[Metaplex]: https://metaplex.com
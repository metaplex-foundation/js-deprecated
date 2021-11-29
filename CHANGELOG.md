## [4.4.2](https://github.com/metaplex/js/compare/v4.4.1...v4.4.2) (2021-11-29)


### Bug Fixes

* restore externalPriceAccount argument in UpdateExternalPriceAccount instruction ([#76](https://github.com/metaplex/js/issues/76)) ([823e141](https://github.com/metaplex/js/commit/823e14148f4b4630862cba0b5fdef4a7a8cb7ed6))

## [4.4.1](https://github.com/metaplex/js/compare/v4.4.0...v4.4.1) (2021-11-26)

# [4.4.0](https://github.com/metaplex/js/compare/v4.3.0...v4.4.0) (2021-11-26)


### Features

* add `Metadata.findDataByOwner` ([#68](https://github.com/metaplex/js/issues/68)) ([248b61b](https://github.com/metaplex/js/commit/248b61baf89a69b88f9a461e32b1cbd54a9b0a18))
* add burn token action ([#72](https://github.com/metaplex/js/issues/72)) ([3bd2381](https://github.com/metaplex/js/commit/3bd2381f846468e2a5d309a31aef7ef639d3da84))
* add end auction transaction ([#64](https://github.com/metaplex/js/issues/64)) ([02e7cb3](https://github.com/metaplex/js/commit/02e7cb3d43372e0ef82ba6f5f59e054588c37035))
* expose action.shared.prepareTokenAccountAndMintTx ([#74](https://github.com/metaplex/js/issues/74)) ([546fc1c](https://github.com/metaplex/js/commit/546fc1c4cd07900f2f7b5738110f8f61adc954be))
* refactoring coingecko + add test for translateCurrency ([#65](https://github.com/metaplex/js/issues/65)) ([0dd4b4a](https://github.com/metaplex/js/commit/0dd4b4aae26cc58e40a5e78e829e48dfca511b7c))

# [4.3.0](https://github.com/metaplex/js/compare/v4.2.1...v4.3.0) (2021-11-16)


### Features

* add create auction v2 transaction ([#62](https://github.com/metaplex/js/issues/62)) ([04bbba7](https://github.com/metaplex/js/commit/04bbba7a831bfc5e71ec5e5596f7fe659ad8664e))

## [4.2.1](https://github.com/metaplex/js/compare/v4.2.0...v4.2.1) (2021-11-12)


### Bug Fixes

* added missing metadata actions to index ([#58](https://github.com/metaplex/js/issues/58)) ([6c7b9f3](https://github.com/metaplex/js/commit/6c7b9f3f8e95298d68fb6771a81002058f35f3c0))
* make max supply optional ([#59](https://github.com/metaplex/js/issues/59)) ([f64c5a2](https://github.com/metaplex/js/commit/f64c5a285ceaf9e0b20d12ea904b33de93fdc6b8))

# [4.2.0](https://github.com/metaplex/js/compare/v4.1.0...v4.2.0) (2021-11-11)


### Features

* add instant sale action ([#57](https://github.com/metaplex/js/issues/57)) ([7011a90](https://github.com/metaplex/js/commit/7011a906e56c11382ce13e88af50a48ef25568a3))

# [4.1.0](https://github.com/metaplex/js/compare/v4.0.0...v4.1.0) (2021-11-10)


### Features

* added new actions for metadata program ([#56](https://github.com/metaplex/js/issues/56)) ([a9208c9](https://github.com/metaplex/js/commit/a9208c976d32b0a64e498279a35146352432ff43))

# [4.0.0](https://github.com/metaplex/js/compare/v3.5.0...v4.0.0) (2021-11-09)


### Bug Fixes

* make getEdition a static method ([#53](https://github.com/metaplex/js/issues/53)) ([fd4ce52](https://github.com/metaplex/js/commit/fd4ce525d8816e9717d8c8ff4c0acdda5e8cfe8c))


### BREAKING CHANGES

* getEdition is now a Metadata's static method

# [3.5.0](https://github.com/metaplex/js/compare/v3.4.1...v3.5.0) (2021-11-08)


### Features

* **actions:** add redeem and claim bid actions ([#55](https://github.com/metaplex/js/issues/55)) ([b4f13f3](https://github.com/metaplex/js/commit/b4f13f30292c7a6f1f2cb43d7cd4c3a002384c54))

## [3.4.1](https://github.com/metaplex/js/compare/v3.4.0...v3.4.1) (2021-11-08)


### Bug Fixes

* fixed circular deps ([#54](https://github.com/metaplex/js/issues/54)) ([84a7272](https://github.com/metaplex/js/commit/84a7272349049da8fcc41d5036781ca5a77d852a))

# [3.4.0](https://github.com/metaplex/js/compare/v3.3.0...v3.4.0) (2021-11-05)


### Features

* Mint NFT Action ([#51](https://github.com/metaplex/js/issues/51)) ([122d08c](https://github.com/metaplex/js/commit/122d08c0ed948dbc13740c78dc9819413c5c6527))

# [3.3.0](https://github.com/metaplex/js/compare/v3.2.0...v3.3.0) (2021-11-05)


### Features

* **actions:** add place bid action  ([#52](https://github.com/metaplex/js/issues/52)) ([1db3e7d](https://github.com/metaplex/js/commit/1db3e7da6845fa03d188615e5d39fa6b38532e68))

# [3.2.0](https://github.com/metaplex/js/compare/v3.1.1...v3.2.0) (2021-11-03)


### Features

* **actions:** add cancel bid action ([#49](https://github.com/metaplex/js/issues/49)) ([b461610](https://github.com/metaplex/js/commit/b46161023c03e7b12190168cf0e5009de0022ad4))

## [3.1.1](https://github.com/metaplex/js/compare/v3.1.0...v3.1.1) (2021-11-03)

# [3.1.0](https://github.com/metaplex/js/compare/v3.0.0...v3.1.0) (2021-10-26)


### Features

* extend AuctionExtendedData with new fields ([#43](https://github.com/metaplex/js/issues/43)) ([41a4e2a](https://github.com/metaplex/js/commit/41a4e2a65439602181f5e56571ea48d5e0ec27a4))

# [3.0.0](https://github.com/metaplex/js/compare/v2.0.1...v3.0.0) (2021-10-20)


### Features

* update package exports ([#40](https://github.com/metaplex/js/issues/40)) ([f0d72ea](https://github.com/metaplex/js/commit/f0d72ea35e932d8ed4d68e1450eb4d6b24ede993))


### BREAKING CHANGES

* export actions & programs in separate folders.

Co-authored-by: Paul Kurochka <kurochka.p@gmail.com>

## [2.0.1](https://github.com/metaplex/js/compare/v2.0.0...v2.0.1) (2021-10-17)


### Bug Fixes

* use prepare instead of postinstall ([#38](https://github.com/metaplex/js/issues/38)) ([fca112a](https://github.com/metaplex/js/commit/fca112aa8ecee3bb76e8a5934530eb5e9666f775))

# [2.0.0](https://github.com/metaplex/js/compare/v1.0.0...v2.0.0) (2021-10-15)


### Features

* bump major version ([c3a7a26](https://github.com/metaplex/js/commit/c3a7a26378f5701cb9c87e88beb90a60763c4e45))


### BREAKING CHANGES

* Don't use Metaplex.init. Provide connection and wallet directly to actions.

# 1.0.0 (2021-10-15)


### Bug Fixes

* add README to npm package ([#24](https://github.com/metaplex/js/issues/24)) ([a3a5a3c](https://github.com/metaplex/js/commit/a3a5a3c350fc4b14449dee378e13b71810f09b09))
* borsh serialize ([c06c989](https://github.com/metaplex/js/commit/c06c9895e812843cf68fe58c11b813b191a1b70a))
* missing exports ([8da7b3d](https://github.com/metaplex/js/commit/8da7b3d14805109c90169dac8e9d9c3b71f12fdf))
* missing exports ([613514c](https://github.com/metaplex/js/commit/613514cfb4d53f0367a5c1e95523243387c858e3))
* multi-package publishing ([#14](https://github.com/metaplex/js/issues/14)) ([1ef6cea](https://github.com/metaplex/js/commit/1ef6ceaa8d5a266a9e8fba0de9d8c2cffcbcdbb8))
* option wallet ([6974ea3](https://github.com/metaplex/js/commit/6974ea3b0323cf77cdc8eed6fcc0bd96dbfed706))
* package.json ([#23](https://github.com/metaplex/js/issues/23)) ([7e7846f](https://github.com/metaplex/js/commit/7e7846f1b23bd79367d52972ddc411dc4dcd2acf))
* serialize fixes ([172a8d7](https://github.com/metaplex/js/commit/172a8d7574b74bca4355c3f01a8198fabcc8a6dd))
* typo rollup config ([7de49a7](https://github.com/metaplex/js/commit/7de49a7393f6301726650d337b958ec6b483ee82))
* yarn install on CI ([#13](https://github.com/metaplex/js/issues/13)) ([cd8f557](https://github.com/metaplex/js/commit/cd8f557729625d6ea433ea90eaa3193d128b4e98))


### Features

* :rocket: get metadata by owner ([8a415b9](https://github.com/metaplex/js/commit/8a415b941a4e8fc1cb1cc137c746da52e325a3d2))
* add html to MetaDataJsonCategory ([#30](https://github.com/metaplex/js/issues/30)) ([b9299cf](https://github.com/metaplex/js/commit/b9299cfa1a95e99d7f3b03e6af47e15382b20e64))
* arweave storage ([#16](https://github.com/metaplex/js/issues/16)) ([48630a9](https://github.com/metaplex/js/commit/48630a951ecda4675d992a65760b29ef6fab545a))
* borsh serialize static method ([540c0a3](https://github.com/metaplex/js/commit/540c0a36805ed56e5ce2ae0eff73c03a6f3891f5))
* ci for publishing ([#12](https://github.com/metaplex/js/issues/12)) ([8ad9910](https://github.com/metaplex/js/commit/8ad99104f485992311b96a4b72fe74b901d3dfdd))
* cleanup and tests ([6bcb218](https://github.com/metaplex/js/commit/6bcb21805219f538b98708988bf8144fdbe4cb3a))
* couple of transactions ([1441dc9](https://github.com/metaplex/js/commit/1441dc9f186014747a6f7e884afb5e4a6e3128d7))
* couple of txs ([55dc6cc](https://github.com/metaplex/js/commit/55dc6cc22d6792f8e309b34e45fa18faa90b1f17))
* edition marker ([4ed704c](https://github.com/metaplex/js/commit/4ed704c9bb02fb30e49582ffcbfdd663816162f3))
* find many for auction/manager/metadata ([3900594](https://github.com/metaplex/js/commit/39005940e8af11aca9813cff19c1fb15125fb505))
* getMetdataByOwnerV2 ([64add73](https://github.com/metaplex/js/commit/64add734ccf1abdc219efebfc178426a4f30d02a))
* init & actions example ([b661106](https://github.com/metaplex/js/commit/b661106f9b699afa79e210a5db35f964d27faa82))
* metadata findmany creators filter ([cf43617](https://github.com/metaplex/js/commit/cf4361746ca165ec4dca91b3e51383bfffc33c9e))
* minor fixes ([a750cf3](https://github.com/metaplex/js/commit/a750cf388aec40b4ce394c0c38a217ca9a0b2188))
* root aliases ([9b7cc08](https://github.com/metaplex/js/commit/9b7cc082b91a4460896efc230231067bd51854db))
* set whitelisted tx & minor fixes ([17f592f](https://github.com/metaplex/js/commit/17f592fbb8eb0782866b53d2dd885fbc470e6012))
* some txs ([360933b](https://github.com/metaplex/js/commit/360933b27cc3e6ac017d351b595909d9cee528df))
* update get program accounts ([5452b93](https://github.com/metaplex/js/commit/5452b9371ab076ba5865fd00db9d5307e0de110a))
* update rollup for esm/node ([f297b82](https://github.com/metaplex/js/commit/f297b82df4969a4c6730fdac7eea00f8d829210d))
* wallet ([525a446](https://github.com/metaplex/js/commit/525a44628f758c56c6b874c44d844b2a87dd71b1))
* wip nft packs - voucher & proving ([035a3e6](https://github.com/metaplex/js/commit/035a3e6b8136a20625886fa744c9677e06f8e0b0))
* wip nft packs support ([680f263](https://github.com/metaplex/js/commit/680f26378bb7e291b2405232f53b17c07a52ee37))
* wip read-only methods ([3e3863b](https://github.com/metaplex/js/commit/3e3863be5f397168c55b0444b3edf3e6c1a1168a))
* wip set store ([bf63cc6](https://github.com/metaplex/js/commit/bf63cc676a44dd0a4d4f33c208ae5e6f467868f8))
* wip transactions & borsh refactor ([45db5e5](https://github.com/metaplex/js/commit/45db5e5d8efa7f04807236c51d2e345fc0ebc586))
* wip update tranactions & building ([58667c5](https://github.com/metaplex/js/commit/58667c5621c946df2ea47b70a9cf532ac90422db))

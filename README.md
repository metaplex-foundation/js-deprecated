# @metaplex/js &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/metaplex/js/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@metaplex/js.svg?style=flat)](https://www.npmjs.com/package/@metaplex/js)

Metaplex JavaScript SDK

> **In Development** - All interfaces are very likely to change very frequently. Please be aware.

[Learn how to use Metaplex JavaScript SDK in your own project](https://docs.metaplex.com/development/clients/js-sdk/getting-started).

## Roadmap

- [x] Load and Deserialize Accounts
- [x] Child Accounts
- [x] Transactions
- [ ] Actions (mint NFT, create auction, ...)
- [ ] Candy Machine
- [ ] More negative tests

## Load and Deserialize Accounts

```ts
import { Connection, Metadata, Auction, Vault, AuctionManager, Store } from '@metaplex/js';

const connection = new Connection('devnet');

// Format: await <AccountType>.load(connection, pubkey);
const account = await Account.load(connection, '<pubkey>');

// Metadata
const metadata = await Metadata.load(connection, '<pubkey>');
// Auction
const auction = await Auction.load(connection, '<pubkey>');
// Vault
const vault = await Vault.load(connection, '<pubkey>');
// Metaplex
const auctionManager = await AuctionManager.load(connection, '<pubkey>');
const store = await Store.load(connection, '<pubkey>');
```

## Send transactions

The Metaplex SDK currently has low level transaction convenience classes for all the necessary operations.

```ts

import { Connection, Wallet, Actions } from '@metaplex/js';

const connection = new Connection('devnet');

await Actions.initStore({ connection, wallet });

```

## Providers

### Coingecko - for exchange rates
```ts
import { Coingecko, Currency } from "@metaplex/js";
const rates = await new Coingecko().getRate([Currency.AR, Currency.SOL], Currency.USD);
```

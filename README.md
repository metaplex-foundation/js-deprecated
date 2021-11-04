# @metaplex/js &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/metaplex/js/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@metaplex/js.svg?style=flat)](https://www.npmjs.com/package/@metaplex/js)

Metaplex JavaScript SDK

> **In Development** - All interfaces are very likely to change very frequently. Please be aware.

[Learn how to use Metaplex JavaScript SDK in your own project](https://docs.metaplex.com/development/clients/js-sdk/getting-started).

## Load and Deserialize Accounts

```ts
import { Connection, Account, programs } from '@metaplex/js';
const { metaplex: { Store, AuctionManager }, metadata: { Metadata }, auction: { Auction }, vault: { Vault } } = programs;


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

import { Connection, Wallet, actions } from '@metaplex/js';

const connection = new Connection('devnet');

await actions.initStore({ connection, wallet });

```

## Providers

### Coingecko - for exchange rates
```ts
import { Coingecko, Currency } from '@metaplex/js';
const rates = await new Coingecko().getRate([Currency.AR, Currency.SOL], Currency.USD);
```

## Checklist

- [x] Structure
  - [x] Builds and Deployments
  - [x] Connection, Account, Transaction, Errors
- [x] Programs (serialize/deserialize accounts, rpc transactions, simple actions)
  - [x] Metadata
    - [x] Accounts
      - [x] Metadata
      - [x] Master Edition
      - [x] Edition
      - [x] Edition Marker
    - [ ] Instructions
      - [x] CreateMetadataAccount
      - [x] UpdateMetadataAccount
      - [x] UpdatePrimarySaleHappenedViaToken
      - [x] SignMetadata
      - [x] CreateMasterEdition
      - [x] MintNewEditionFromMasterEditionViaToken
      - [ ] MintNewEditionFromMasterEditionViaVaultProxy
    - [ ] Actions
      - [ ] Create
      - [ ] Update
      - [ ] Sign
      - [ ] Send
      - [ ] Mint
      - [ ] Burn
  - [ ] Metaplex
    - [ ] Accounts
      - [x] Bid Redemption Ticket
      - [x] Auction Manager (V2)
      - [ ] Safety Deposit Validation Ticket
      - [x] Payout Ticket
      - [ ] Token Tracker
      - [x] Prize Tracking Ticket
      - [ ] Auction Cache
      - [ ] Store Indexer
      - [x] Store
      - [x] Whitelisted Creator
      - [x] Safety Deposit Config
      - [ ] Original Authority Lookup
    - [ ] Instructions
      - [x] RedeemBid
      - [ ] RedeemFullRightsTransferBid
      - [x] StartAuction
      - [x] ClaimBid
      - [ ] EmptyPaymentAccount
      - [x] SetStore
      - [x] SetWhitelistedCreator
      - [ ] RedeemUnusedWinningConfigItemsAsAuctioneer
      - [ ] DecommissionAuctionManager
      - [ ] RedeemPrintingV2Bid
      - [ ] WithdrawMasterEdition
      - [x] InitAuctionManagerV2
      - [ ] ValidateSafetyDepositBoxV2
      - [ ] RedeemParticipationBidV3
      - [ ] EndAuction
      - [ ] SetStoreIndex
      - [ ] SetAuctionCache
    - [ ] Actions
  - [ ] Auction
    - [x] Accounts
      - [x] Auction
      - [x] Auction Extended
      - [x] Bidder Pot
      - [x] Bidder Meta
    - [ ] Instructions
      - [x] CancelBid
      - [ ] CreateAuctionV2
      - [ ] ClaimBid
      - [ ] EndAuction
      - [ ] StartAuction
      - [x] SetAuthority
      - [x] PlaceBid
    - [ ] Actions (no standalone actions)
      - [x] Cancel Bid
      - [ ] Place Bid
  - [ ] Vault
    - [ ] Accounts
      - [x] Safety Deposit Box
      - [x] Vault
      - [x] External Price
    - [ ] Instructions
      - [x] InitVault
      - [x] AddTokenToInactiveVault
      - [x] ActivateVault
      - [x] CombineVault
      - [ ] RedeemShares
      - [x] WithdrawTokenFromSafetyDepositBox
      - [ ] MintFractionalShares
      - [ ] WithdrawSharesFromTreasury
      - [ ] AddSharesToTreasury
      - [x] UpdateExternalPriceAccount
      - [x] SetAuthority
    - [ ] Actions
  - [ ] Candy Machine
    - [ ] Accounts
      - [ ] Candy Machine
    - [ ] Instructions
      - [ ] Mint
      - [ ] Update
      - [ ] Initialize
      - [ ] Initialize Config
      - [ ] Add Config Lines
    - [ ] Actions
  - [ ] Fair Launch
    - [ ] Accounts
      - [ ] Fair Launch
      - [ ] Ticket
      - [ ] Ticket Seq Lookup
      - [ ] Lottery Bitmap
    - [ ] Instructions
      - [ ] Initialize
      - [ ] Update
      - [ ] Create Lottery Bitmap
      - [ ] Update Lottery Bitmap
      - [ ] Start Phase Three
      - [ ] Restart Phase Two
      - [ ] Purchase Ticket
      - [ ] Adjust Ticket
      - [ ] Punch Ticket
      - [ ] Create Ticket Seq
      - [ ] Withdraw Funds
      - [ ] Receive Refund
      - [ ] Set Token Metadata
      - [ ] Set Participation NFT
      - [ ] Update Participation NFT
      - [ ] Mint Participation NFT
      - [ ] Mint Tokens
    - [ ] Actions
  - [ ] Packs TBD
  - [ ] Airdrop TBD
  - [ ] Fusion TBD
- [ ] Providers
  - [ ] CoinGecko
  - [ ] Arweave
- [ ] Global (common use cases)
  - [ ] Actions

# @metaplex/js

Metaplex JavaScript SDK

> **In Development** - All interfaces are very likely to change very frequently. Please be aware.

## Roadmap

- [ ] Load and Deserialize Accounts
- [ ] Candy Machine
- [ ] Child Accounts
- [ ] Transactions
- [ ] Helpers (ease of use)

## Load and Deserialize Accounts

```ts
import metaplex from "@metaplex/js";

const conn = new metaplex.Connection("devnet");

// Format: await <AccountType>.load(connection, pubkey);
const account = await metaplex.Account.load(conn, "<pubkey>");

// Metadata Program Accounts
const { Metadata, Edition, MasterEdition } = metaplex;
const metadata = await Metadata.load(conn, "<pubkey>");
const edition = await Edition.load(conn, "<pubkey>");
const masterEdition = await MasterEdition.load(conn, "<pubkey>");

// Auction Program Accounts
const { Auction, BidderMetadata, BidderPot } = metaplex;
const auction = await Auction.load(conn, "<pubkey>");
const bidderMetadata = await BidderMetadata.load(conn, "<pubkey>");
const bidderPot = await BidderPot.load(conn, "<pubkey>");

// Vault Program Accounts
const { Vault, SafetyDepositBox } = metaplex;
const vault = await Vault.load(conn, "<pubkey>");
const safetyDepositBox = await SafetyDepositBox.load(conn, "<pubkey>");

// Metaplex Program Accounts
const {
  AuctionManager,
  BidRedemptionTicket,
  PayoutTicket,
  PrizeTrackingTicket,
  SafetyDepositConfig,
  Store,
  WhitelistedCreator,
} = metaplex;
const auctionManager = await AuctionManager.load(conn, "<pubkey>");
const bidRedemptionTicket = await BidRedemptionTicket.load(conn, "<pubkey>");
const payoutTicket = await PayoutTicket.load(conn, "<pubkey>");
const prizeTrackingTicket = await PrizeTrackingTicket.load(conn, "<pubkey>");
const safetyDepositConfig = await SafetyDepositConfig.load(conn, "<pubkey>");
const store = await Store.load(conn, "<pubkey>");
const whitelistedCreator = await WhitelistedCreator.load(conn, "<pubkey>");
```

## Send transactions

The Metaplex SDK currently has low level transaction convenience classes for all the necessary operations.

For example, a transaction to pay for file storage can be created easily with a convenience class:
```ts
// ...
const files: File[] = [artwork, metadata];
const fileHashes = await Promise.all(files.map((file) => Utils.Crypto.getFileHash(file)));
const lamports = await storage.getAssetCostToStore(files, rates[0].rate, rates[1].rate);

const payForFilesTx = new PayForFiles(
  {
    feePayer: creator.publicKey,
  },
  {
    lamports,
    fileHashes,
  },
);
```

The transactions are currently standard Solana transactions and can be signed, sent and verified after creation.

Multiple transactions can also be combined into one larger transaction:
```ts
const combinedTransaction = Transaction.fromCombined([
  payForFilesTx,
  createMintTx,
  createAssociatedTokenAccountTx,
]);
```

You can see examples of full transaction processes in the tests:
- `test/mint.test.ts` - Contains a full NFT minting process example.

## Providers

### Coingecko - for exchange rates
```ts
import { Coingecko, Currency } from "@metaplex/js";
const rates = await new Coingecko().getRate([Currency.AR, Currency.SOL], Currency.USD);
```

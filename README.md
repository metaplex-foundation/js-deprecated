# @metaplex/js

Metaplex JavaScript SDK

> **In Development**

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

import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { ERROR_INVALID_OWNER } from '../../../errors';
import { AnyPublicKey, StringPublicKey } from '../../../types';
import { borsh } from '../../../utils';
import { Account } from '../../../Account';
import Program, { AuctionProgram } from '../AuctionProgram';
import { BidderMetadata } from './BidderMetadata';
import { BidderPot } from './BidderPot';
import { Buffer } from 'buffer';

export enum AuctionState {
  Created = 0,
  Started,
  Ended,
}

export enum BidStateType {
  EnglishAuction = 0,
  OpenEdition = 1,
}

export enum PriceFloorType {
  None = 0,
  Minimum = 1,
  BlindedPrice = 2,
}

export interface Bid {
  key: StringPublicKey;
  amount: BN;
}

const bidStruct = borsh.struct<Bid>([
  ['key', 'pubkeyAsString'],
  ['amount', 'u64'],
]);

export interface BidState {
  type: BidStateType;
  bids: Bid[];
  max: BN;
}

const bidStateStruct = borsh.struct<BidState>(
  [
    ['type', 'u8'],
    ['bids', [bidStruct.type]],
    ['max', 'u64'],
  ],
  [bidStruct],
);

export interface PriceFloor {
  type: PriceFloorType;
  // It's an array of 32 u8s, when minimum, only first 8 are used (a u64), when blinded price, the entire
  // thing is a hash and not actually a public key, and none is all zeroes
  hash: Uint8Array;
  minPrice?: BN;
}

const priceFloorStruct = borsh.struct<PriceFloor>(
  [
    ['type', 'u8'],
    ['hash', [32]],
  ],
  [],
  (data) => {
    if (!data.hash) data.hash = new Uint8Array(32);
    if (data.type === PriceFloorType.Minimum) {
      if (data.minPrice) {
        data.hash.set(data.minPrice.toArrayLike(Buffer, 'le', 8), 0);
      } else {
        data.minPrice = new BN((data.hash || new Uint8Array(0)).slice(0, 8), 'le');
      }
    }
    return data;
  },
);

export interface AuctionData {
  /// Pubkey of the authority with permission to modify this auction.
  authority: StringPublicKey;
  /// Token mint for the SPL token being used to bid
  tokenMint: StringPublicKey;
  /// The time the last bid was placed, used to keep track of auction timing.
  lastBid: BN | null;
  /// Slot time the auction was officially ended by.
  endedAt: BN | null;
  /// End time is the cut-off point that the auction is forced to end by.
  endAuctionAt: BN | null;
  /// Gap time is the amount of time in slots after the previous bid at which the auction ends.
  auctionGap: BN | null;
  /// Minimum price for any bid to meet.
  priceFloor: PriceFloor;
  /// The state the auction is in, whether it has started or ended.
  state: AuctionState;
  /// Auction Bids, each user may have one bid open at a time.
  bidState: BidState;
  /// Used for precalculation on the front end, not a backend key
  bidRedemptionKey?: StringPublicKey;
}

const auctionDataStruct = borsh.struct<AuctionData>(
  [
    ['authority', 'pubkeyAsString'],
    ['tokenMint', 'pubkeyAsString'],
    ['lastBid', { kind: 'option', type: 'u64' }],
    ['endedAt', { kind: 'option', type: 'u64' }],
    ['endAuctionAt', { kind: 'option', type: 'u64' }],
    ['auctionGap', { kind: 'option', type: 'u64' }],
    ['priceFloor', priceFloorStruct.type],
    ['state', 'u8'],
    ['bidState', bidStateStruct.type],
  ],
  [priceFloorStruct, bidStateStruct],
);

export class Auction extends Account<AuctionData> {
  static readonly EXTENDED_DATA_SIZE = 8 + 9 + 2 + 200;

  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    this.data = auctionDataStruct.deserialize(this.info.data);
  }

  static getPDA(vault: AnyPublicKey) {
    return Program.findProgramAddress([
      Buffer.from(AuctionProgram.PREFIX),
      AuctionProgram.PUBKEY.toBuffer(),
      new PublicKey(vault).toBuffer(),
    ]);
  }

  async getBidderPots(connection: Connection) {
    return (
      await Program.getProgramAccounts(connection, {
        filters: [
          // Filter for BidderPot by data size
          {
            dataSize: BidderPot.DATA_SIZE,
          },
          // Filter for assigned to this auction
          {
            memcmp: {
              offset: 32 + 32,
              bytes: this.pubkey.toBase58(),
            },
          },
        ],
      })
    ).map((account) => BidderPot.from(account));
  }

  async getBidderMetadata(connection: Connection) {
    return (
      await Program.getProgramAccounts(connection, {
        filters: [
          // Filter for BidderMetadata by data size
          {
            dataSize: BidderMetadata.DATA_SIZE,
          },
          // Filter for assigned to this auction
          {
            memcmp: {
              offset: 32,
              bytes: this.pubkey.toBase58(),
            },
          },
        ],
      })
    ).map((account) => BidderMetadata.from(account));
  }
}

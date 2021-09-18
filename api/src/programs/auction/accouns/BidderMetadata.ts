import { AccountInfo } from '@solana/web3.js';
import BN from 'bn.js';
import { Account } from '../../../Account';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { borsh } from '@metaplex/utils';
import { AuctionProgram } from '../AuctionProgram';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '@metaplex/errors';
import { Buffer } from 'buffer';

export interface BidderMetadataData {
  // Relationship with the bidder who's metadata this covers.
  bidderPubkey: StringPublicKey;
  // Relationship with the auction this bid was placed on.
  auctionPubkey: StringPublicKey;
  // Amount that the user bid.
  lastBid: BN;
  // Tracks the last time this user bid.
  lastBidTimestamp: BN;
  // Whether the last bid the user made was cancelled. This should also be enough to know if the
  // user is a winner, as if cancelled it implies previous bids were also cancelled.
  cancelled: boolean;
}

const bidderMetadataStruct = borsh.struct<BidderMetadataData>([
  ['bidderPubkey', 'pubkeyAsString'],
  ['auctionPubkey', 'pubkeyAsString'],
  ['lastBid', 'u64'],
  ['lastBidTimestamp', 'u64'],
  ['cancelled', 'u8'],
]);

export class BidderMetadata extends Account<BidderMetadataData> {
  static readonly DATA_SIZE = 32 + 32 + 8 + 8 + 1;

  constructor(key: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(key, info);

    if (!this.assertOwner(AuctionProgram.PUBKEY)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!BidderMetadata.isBidderMetadata(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = bidderMetadataStruct.deserialize(this.info.data);
  }

  static isBidderMetadata(data: Buffer) {
    return data.length === BidderMetadata.DATA_SIZE;
  }
}

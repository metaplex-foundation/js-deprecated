import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import bs58 from 'bs58';
import { AnyPublicKey, StringPublicKey } from '../../types';
import { borsh } from '../../utils';
import { Account } from '../Account';
import { BidRedemptionTicket, WINNER_INDEX_OFFSETS } from './BidRedemptionTicket';
import Program, { MetaplexKey, MetaplexProgram } from './MetaplexProgram';
import {
  ERROR_DEPRECATED_ACCOUNT_DATA,
  ERROR_INVALID_ACCOUNT_DATA,
  ERROR_INVALID_OWNER,
} from '../../errors';
import { Auction } from '../auction';

export enum AuctionManagerStatus {
  Initialized,
  Validated,
  Running,
  Disbursing,
  Finished,
}

export interface AuctionManagerStateV2 {
  status: AuctionManagerStatus;
  safetyConfigItemsValidated: BN;
  bidsPushedToAcceptPayment: BN;
  hasParticipation: boolean;
}

const AuctionManagerStateV2Struct = borsh.struct<AuctionManagerStateV2>(
  [
    ['status', 'u8'],
    ['safetyConfigItemsValidated', 'u64'],
    ['bidsPushedToAcceptPayment', 'u64'],
    ['hasParticipation', 'u8'],
  ],
  [],
  (data) =>
    Object.assign(
      {
        status: AuctionManagerStatus.Initialized,
        safetyConfigItemsValidated: new BN(0),
        bidsPushedToAcceptPayment: new BN(0),
        hasParticipation: false,
      },
      data,
    ),
);

export interface AuctionManagerV2Data {
  key: MetaplexKey;
  store: StringPublicKey;
  authority: StringPublicKey;
  auction: StringPublicKey;
  vault: StringPublicKey;
  acceptPayment: StringPublicKey;
  state: AuctionManagerStateV2;
}

const AuctionManagerV2Struct = borsh.struct<AuctionManagerV2Data>(
  [
    ['key', 'u8'],
    ['store', 'pubkeyAsString'],
    ['authority', 'pubkeyAsString'],
    ['auction', 'pubkeyAsString'],
    ['vault', 'pubkeyAsString'],
    ['acceptPayment', 'pubkeyAsString'],
    ['state', AuctionManagerStateV2Struct.type],
  ],
  [AuctionManagerStateV2Struct],
  (data) => {
    data.key = MetaplexKey.AuctionManagerV2;
    return data;
  },
);

export class AuctionManager extends Account<AuctionManagerV2Data> {
  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (AuctionManager.isAuctionManagerV1(this.info.data)) {
      throw ERROR_DEPRECATED_ACCOUNT_DATA();
    } else if (AuctionManager.isAuctionManagerV2(this.info.data)) {
      this.data = AuctionManagerV2Struct.deserialize(this.info.data);
    } else {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }
  }

  static isAuctionManager(data: Buffer) {
    return AuctionManager.isAuctionManagerV1(data) || AuctionManager.isAuctionManagerV2(data);
  }

  static isAuctionManagerV1(data: Buffer) {
    return data[0] === MetaplexKey.AuctionManagerV1;
  }

  static isAuctionManagerV2(data: Buffer) {
    return data[0] === MetaplexKey.AuctionManagerV2;
  }

  static getPDA(auction: AnyPublicKey) {
    return Program.findProgramAddress([
      Buffer.from(MetaplexProgram.PREFIX),
      new PublicKey(auction).toBuffer(),
    ]);
  }

  async getAuction(connection: Connection) {
    return Auction.load(connection, this.data.auction);
  }

  async getBidRedemptionTickets(connection: Connection, haveWinnerIndex = true) {
    return (
      await Program.getProgramAccounts(connection, {
        filters: [
          // Filter for BidRedemptionTicketV2 by key
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(Buffer.from([MetaplexKey.BidRedemptionTicketV2])),
            },
          },
          // Filter for assigned to this auction manager
          {
            memcmp: {
              offset: WINNER_INDEX_OFFSETS[+haveWinnerIndex],
              bytes: this.pubkey.toBase58(),
            },
          },
        ],
      })
    ).map((account) => BidRedemptionTicket.from(account));
  }
}

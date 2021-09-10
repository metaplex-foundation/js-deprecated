import { borsh } from '../../utils';
import { AnyPublicKey, StringPublicKey } from '../../types';
import Program from './AuctionProgram';
import { AccountInfo } from '@solana/web3.js';
import { Account } from '../Account';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '../../errors';

export interface BiddePotData {
  /// Points at actual pot that is a token account
  bidderPot: StringPublicKey;
  bidderAct: StringPublicKey;
  auctionAct: StringPublicKey;
  emptied: boolean;
}

const bidderPotStruct = borsh.struct<BiddePotData>([
  ['bidderPot', 'pubkeyAsString'],
  ['bidderAct', 'pubkeyAsString'],
  ['auctionAct', 'pubkeyAsString'],
  ['emptied', 'u8'],
]);

export class BidderPot extends Account<BiddePotData> {
  static readonly DATA_SIZE = 32 + 32 + 32 + 1;
  readonly PROGRAM = Program;

  constructor(key: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(key, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!BidderPot.isBidderPot(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = bidderPotStruct.deserialize(this.info.data);
  }

  static isBidderPot(data: Buffer) {
    return data.length === BidderPot.DATA_SIZE;
  }
}

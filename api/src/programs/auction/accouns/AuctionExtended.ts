import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '../../../errors';
import { AnyPublicKey } from '../../../types';
import { borsh } from '../../../utils';
import { Account } from '../../../Account';
import Program, { AuctionProgram } from '../AuctionProgram';
import { Buffer } from 'buffer';

export interface AuctionDataExtended {
  totalUncancelledBids: BN;
  tickSize: BN | null;
  gapTickSizePercentage: number | null;
}

const auctionDataExtendedStruct = borsh.struct<AuctionDataExtended>([
  ['totalUncancelledBids', 'u64'],
  ['tickSize', { kind: 'option', type: 'u64' }],
  ['gapTickSizePercentage', { kind: 'option', type: 'u8' }],
]);

export class AuctionExtended extends Account<AuctionDataExtended> {
  static readonly DATA_SIZE = 8 + 9 + 2 + 200;

  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!AuctionExtended.isAuctionExtended(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = auctionDataExtendedStruct.deserialize(this.info.data);
  }

  static isAuctionExtended(data: Buffer) {
    return data.length === AuctionExtended.DATA_SIZE;
  }

  static getPDA(vault: AnyPublicKey) {
    return Program.findProgramAddress([
      Buffer.from(AuctionProgram.PREFIX),
      AuctionProgram.PUBKEY.toBuffer(),
      new PublicKey(vault).toBuffer(),
      Buffer.from(AuctionProgram.EXTENDED),
    ]);
  }
}

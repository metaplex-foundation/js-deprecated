import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { AnyPublicKey } from '@metaplex/types';
import { borsh } from '@metaplex/utils';
import { Account } from '../../../Account';
import Program, { MetaplexKey, MetaplexProgram } from '../MetaplexProgram';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '@metaplex/errors';
import { Buffer } from 'buffer';

export interface PrizeTrackingTicketData {
  key: MetaplexKey;
  metadata: string;
  supplySnapshot: BN;
  expectedRedemptions: BN;
  redemptions: BN;
}

const prizeTrackingTicketStruct = borsh.struct<PrizeTrackingTicketData>(
  [
    ['key', 'u8'],
    ['metadata', 'pubkeyAsString'],
    ['supplySnapshot', 'u64'],
    ['expectedRedemptions', 'u64'],
    ['redemptions', 'u64'],
  ],
  [],
  (data) => {
    data.key = MetaplexKey.PrizeTrackingTicketV1;
    return data;
  },
);

export class PrizeTrackingTicket extends Account<PrizeTrackingTicketData> {
  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!PrizeTrackingTicket.isPrizeTrackingTicket(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = prizeTrackingTicketStruct.deserialize(this.info.data);
  }

  static isPrizeTrackingTicket(data: Buffer) {
    return data[0] === MetaplexKey.PrizeTrackingTicketV1;
  }

  static async getPDA(auctionManager: AnyPublicKey, mint: AnyPublicKey) {
    return Program.findProgramAddress([
      Buffer.from(MetaplexProgram.PREFIX),
      MetaplexProgram.PUBKEY.toBuffer(),
      new PublicKey(auctionManager).toBuffer(),
      new PublicKey(mint).toBuffer(),
    ]);
  }
}

import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import bs58 from 'bs58';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { borsh } from '@metaplex/utils';
import { Account } from '../../../Account';
import { MetaplexKey, MetaplexProgram } from '../MetaplexProgram';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '@metaplex/errors';
import { Buffer } from 'buffer';

export interface PayoutTicketData {
  key: MetaplexKey;
  recipient: StringPublicKey;
  amountPaid: BN;
}

const payoutTicketStruct = borsh.struct<PayoutTicketData>(
  [
    ['key', 'u8'],
    ['recipient', 'pubkeyAsString'],
    ['amountPaid', 'u64'],
  ],
  [],
  (data) => {
    data.key = MetaplexKey.PayoutTicketV1;
    return data;
  },
);

export class PayoutTicket extends Account<PayoutTicketData> {
  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(MetaplexProgram.PUBKEY)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!PayoutTicket.isCompatible(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = payoutTicketStruct.deserialize(this.info.data);
  }

  static isCompatible(data: Buffer) {
    return data[0] === MetaplexKey.PayoutTicketV1;
  }

  static async getPayoutTicketsByRecipient(connection: Connection, recipient: AnyPublicKey) {
    return (
      await MetaplexProgram.getProgramAccounts(connection, {
        filters: [
          // Filter for PayoutTicketV1 by key
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(Buffer.from([MetaplexKey.PayoutTicketV1])),
            },
          },
          // Filter for assigned to recipient
          {
            memcmp: {
              offset: 1,
              bytes: new PublicKey(recipient).toBase58(),
            },
          },
        ],
      })
    ).map((account) => PayoutTicket.from(account));
  }
}

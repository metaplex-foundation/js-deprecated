import { AnyPublicKey, StringPublicKey } from '../../types';
import { borsh } from '../../utils';
import { MetaplexProgram, MetaplexKey } from './MetaplexProgram';
import { AccountInfo } from '@solana/web3.js';
import BN from 'bn.js';

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

export class PayoutTicket extends MetaplexProgram<PayoutTicketData> {
  constructor(pubkey: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (this.info && this.isOwner() && PayoutTicket.isPayoutTicket(this.info.data)) {
      this.data = payoutTicketStruct.deserialize(this.info.data);
    }
  }

  static isPayoutTicket(data: Buffer) {
    return data[0] === MetaplexKey.PayoutTicketV1;
  }
}

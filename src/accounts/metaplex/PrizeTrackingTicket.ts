import { AnyPublicKey } from '../../types'
import { borsh } from '../../utils'
import { MetaplexProgram, MetaplexKey } from './MetaplexProgram'
import { AccountInfo } from '@solana/web3.js'
import BN from 'bn.js'

export interface PrizeTrackingTicketData {
  key: MetaplexKey
  metadata: string
  supplySnapshot: BN
  expectedRedemptions: BN
  redemptions: BN
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
    data.key = MetaplexKey.PrizeTrackingTicketV1
    return data
  },
)

export class PrizeTrackingTicket extends MetaplexProgram<PrizeTrackingTicketData> {
  constructor(pubkey: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(pubkey, info)

    if (this.info && this.isOwner() && PrizeTrackingTicket.isPrizeTrackingTicket(this.info.data)) {
      this.data = prizeTrackingTicketStruct.deserialize(this.info.data)
    }
  }

  static isPrizeTrackingTicket(data: Buffer) {
    return data[0] === MetaplexKey.PrizeTrackingTicketV1
  }
}

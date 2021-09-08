import { borsh } from '../../utils'
import { AnyPublicKey, StringPublicKey } from '../../types'
import { AuctionProgram } from './AuctionProgram'
import { AccountInfo } from '@solana/web3.js'

export interface BiddePotData {
  /// Points at actual pot that is a token account
  bidderPot: StringPublicKey
  bidderAct: StringPublicKey
  auctionAct: StringPublicKey
  emptied: boolean
}

const bidderPotStruct = borsh.struct<BiddePotData>([
  ['bidderPot', 'pubkeyAsString'],
  ['bidderAct', 'pubkeyAsString'],
  ['auctionAct', 'pubkeyAsString'],
  ['emptied', 'u8'],
])

export class BidderPot extends AuctionProgram<BiddePotData> {
  static readonly DATA_SIZE = 32 + 32 + 32 + 1

  constructor(key: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(key, info)

    if (this.info && this.isOwner() && BidderPot.isBidderPot(this.info.data)) {
      this.data = bidderPotStruct.deserialize(this.info.data)
    }
  }

  static isBidderPot(data: Buffer) {
    return data.length === BidderPot.DATA_SIZE
  }
}

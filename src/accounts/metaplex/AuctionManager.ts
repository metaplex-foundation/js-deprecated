import { AnyPublicKey, StringPublicKey } from '../../types'
import { borsh } from '../../utils'
import { MetaplexProgram, MetaplexKey } from './MetaplexProgram'
import { AccountInfo } from '@solana/web3.js'
import BN from 'bn.js'

export enum AuctionManagerStatus {
  Initialized,
  Validated,
  Running,
  Disbursing,
  Finished,
}

export interface AuctionManagerStateV2 {
  status: AuctionManagerStatus
  safetyConfigItemsValidated: BN
  bidsPushedToAcceptPayment: BN
  hasParticipation: boolean
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
)

export interface AuctionManagerV2Data {
  key: MetaplexKey
  store: StringPublicKey
  authority: StringPublicKey
  auction: StringPublicKey
  vault: StringPublicKey
  acceptPayment: StringPublicKey
  state: AuctionManagerStateV2
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
    data.key = MetaplexKey.AuctionManagerV2
    return data
  },
)

export class AuctionManager extends MetaplexProgram<AuctionManagerV2Data> {
  constructor(pubkey: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(pubkey, info)

    if (this.info && this.isOwner()) {
      if (AuctionManager.isAuctionManagerV1(this.info.data)) {
        throw new Error('AuctionManagerV1 is deprecated')
      } else if (AuctionManager.isAuctionManagerV2(this.info.data)) {
        this.data = AuctionManagerV2Struct.deserialize(this.info.data)
      }
    }
  }

  static isAuctionManager(data: Buffer) {
    return AuctionManager.isAuctionManagerV1(data) || AuctionManager.isAuctionManagerV2(data)
  }

  static isAuctionManagerV1(data: Buffer) {
    return data[0] === MetaplexKey.AuctionManagerV1
  }

  static isAuctionManagerV2(data: Buffer) {
    return data[0] === MetaplexKey.AuctionManagerV2
  }
}

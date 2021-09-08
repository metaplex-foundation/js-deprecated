import { AccountInfo, PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { AnyPublicKey, StringPublicKey } from '../../types'
import { borsh } from '../../utils'
import { MetadataKey, MetadataProgram } from './MetadataProgram'

export interface MasterEditionData {
  key: MetadataKey
  supply: BN
  maxSupply?: BN

  /// V1 Only Field
  /// Can be used to mint tokens that give one-time permission to mint a single limited edition.
  printingMint: StringPublicKey
  /// V1 Only Field
  /// If you don't know how many printing tokens you are going to need, but you do know
  /// you are going to need some amount in the future, you can use a token from this mint.
  /// Coming back to token metadata with one of these tokens allows you to mint (one time)
  /// any number of printing tokens you want. This is used for instance by Auction Manager
  /// with participation NFTs, where we dont know how many people will bid and need participation
  /// printing tokens to redeem, so we give it ONE of these tokens to use after the auction is over,
  /// because when the auction begins we just dont know how many printing tokens we will need,
  /// but at the end we will. At the end it then burns this token with token-metadata to
  /// get the printing tokens it needs to give to bidders. Each bidder then redeems a printing token
  /// to get their limited editions.
  oneTimePrintingAuthorizationMint: StringPublicKey
}

const masterEditionV2Struct = borsh.struct<MasterEditionData>(
  [
    ['key', 'u8'],
    ['supply', 'u64'],
    ['maxSupply', { kind: 'option', type: 'u64' }],
  ],
  [],
  (data) => {
    data.key = MetadataKey.MasterEditionV2
    return data
  },
)

const masterEditionV1Struct = borsh.struct<MasterEditionData>(
  [
    ...masterEditionV2Struct.fields,
    ['printingMint', 'pubkeyAsString'],
    ['oneTimePrintingAuthorizationMint', 'pubkeyAsString'],
  ],
  [],
  (data) => {
    data.key = MetadataKey.MasterEditionV1
    return data
  },
)

export class MasterEdition extends MetadataProgram<MasterEditionData> {
  static readonly EDITION_PREFIX = 'edition'

  constructor(key: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(key, info)

    if (this.info && this.isOwner()) {
      if (MasterEdition.isMasterEditionV1(this.info.data)) {
        this.data = masterEditionV1Struct.deserialize(this.info.data)
      } else if (MasterEdition.isMasterEditionV2(this.info.data)) {
        this.data = masterEditionV2Struct.deserialize(this.info.data)
      }
    }
  }

  static async getPDA(mint: AnyPublicKey) {
    return await MasterEdition.findProgramAddress(
      [
        Buffer.from(this.PREFIX),
        this.PUBKEY.toBuffer(),
        new PublicKey(mint).toBuffer(),
        Buffer.from(MasterEdition.EDITION_PREFIX),
      ],
      this.PUBKEY,
    )
  }

  static isMasterEdition(data: Buffer) {
    return MasterEdition.isMasterEditionV1(data) || MasterEdition.isMasterEditionV2(data)
  }

  static isMasterEditionV1(data: Buffer) {
    return data[0] === MetadataKey.MasterEditionV1
  }

  static isMasterEditionV2(data: Buffer) {
    return data[0] === MetadataKey.MasterEditionV2
  }
}

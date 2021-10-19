import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '@metaplex/errors';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Borsh } from '@metaplex/utils';
import { Account } from '../../../Account';
import { NFTPacksAccountType, NFTPacksProgram } from '../NFTPacksProgram';
import { Buffer } from 'buffer';

export enum DistributionType {
  FixedNumber = 0,
  ProbabilityBased = 1,
}

type DistributionArgs = { type: DistributionType; value: BN };
export class Distribution extends Borsh.Data<DistributionArgs> {
  static readonly SCHEMA = this.struct([
    ['type', 'u8'],
    ['value', 'u64'],
  ]);

  type: DistributionType;
  value: BN;
}

type Args = {
  packSet: StringPublicKey;
  master: StringPublicKey;
  metadata: StringPublicKey;
  tokenAccount: StringPublicKey;
  maxSupply?: number;
  distribution: Distribution;
  currentSupply: number;
};
export class PackCardData extends Borsh.Data<Args> {
  static readonly SCHEMA = new Map([
    ...Distribution.SCHEMA,
    ...this.struct([
      ['accountType', 'u8'],
      ['packSet', 'pubkeyAsString'],
      ['master', 'pubkeyAsString'],
      ['metadata', 'pubkeyAsString'],
      ['tokenAccount', 'pubkeyAsString'],
      ['maxSupply', { kind: 'option', type: 'u32' }],
      ['distribution', Distribution],
      ['currentSupply', 'u32'],
    ]),
  ]);

  accountType: NFTPacksAccountType;
  /// Pack set
  packSet: StringPublicKey;
  /// Master edition account
  master: StringPublicKey;
  /// Metadata account
  metadata: StringPublicKey;
  /// Program token account which holds MasterEdition token
  tokenAccount: StringPublicKey;
  /// How many instances of this card exists in all packs
  maxSupply?: number;
  /// Fixed number / probability-based
  distribution: Distribution;
  /// How many cards already minted
  currentSupply: number;

  constructor(args: Args) {
    super(args);
    this.accountType = NFTPacksAccountType.PackCard;
  }
}

export class PackCard extends Account<PackCardData> {
  static readonly PREFIX = 'card';

  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(NFTPacksProgram.PUBKEY)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!PackCard.isCompatible(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = PackCardData.deserialize(this.info.data);
  }

  static isCompatible(data: Buffer) {
    return data[0] === NFTPacksAccountType.PackCard;
  }

  static getPDA(packSet: AnyPublicKey, index: number) {
    return NFTPacksProgram.findProgramAddress([
      Buffer.from(PackCard.PREFIX),
      new PublicKey(packSet).toBuffer(),
      Buffer.from(index.toString()),
    ]);
  }
}

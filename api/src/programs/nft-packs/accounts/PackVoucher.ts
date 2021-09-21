import { AccountInfo, PublicKey } from '@solana/web3.js';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '@metaplex/errors';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Borsh } from '@metaplex/utils';
import { Account } from '../../../Account';
import { NFTPacksAccountType, NFTPacksProgram } from '../NFTPacksProgram';
import { Buffer } from 'buffer';

export enum ActionOnProve {
  Burn = 0,
  Redeem = 1,
}

type Args = {
  packSet: StringPublicKey;
  master: StringPublicKey;
  metadata: StringPublicKey;
  tokenAccount: StringPublicKey;
  maxSupply?: number;
  currentSupply: number;
  numberToOpen: number;
  actionOnProve: ActionOnProve;
};
export class PackVoucherData extends Borsh.Data<Args> {
  static readonly SCHEMA = this.struct([
    ['accountType', 'u8'],
    ['packSet', 'pubkeyAsString'],
    ['master', 'pubkeyAsString'],
    ['metadata', 'pubkeyAsString'],
    ['tokenAccount', 'pubkeyAsString'],
    ['maxSupply', { kind: 'option', type: 'u32' }],
    ['currentSupply', 'u32'],
    ['numberToOpen', 'u32'],
    ['actionOnProve', 'u8'],
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
  /// How many instances of this voucher exists in all packs
  maxSupply?: number;
  /// How many vouchers already minted
  currentSupply: number;
  /// How many vouchers of this type is required to open a pack
  numberToOpen: number;
  /// Burn / redeem
  actionOnProve: ActionOnProve;

  constructor(args: Args) {
    super(args);
    this.accountType = NFTPacksAccountType.PackVoucher;
  }
}

export class PackVoucher extends Account<PackVoucherData> {
  static readonly PREFIX = 'voucher';

  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(NFTPacksProgram.PUBKEY)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!PackVoucher.isCompatible(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = PackVoucherData.deserialize(this.info.data);
  }

  static isCompatible(data: Buffer) {
    return data[0] === NFTPacksAccountType.PackVoucher;
  }

  static getPDA(packSet: AnyPublicKey, index: number) {
    return NFTPacksProgram.findProgramAddress([
      Buffer.from(PackVoucher.PREFIX),
      new PublicKey(packSet).toBuffer(),
      Buffer.from(index.toString()),
    ]);
  }
}

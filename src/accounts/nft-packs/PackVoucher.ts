import { AccountInfo, PublicKey } from '@solana/web3.js';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '../../errors';
import { AnyPublicKey, StringPublicKey } from '../../types';
import { borsh } from '../../utils';
import { Account } from '../Account';
import Program, { NFTPacksAccountType } from './NFTPacksProgram';

export enum ActionOnProve {
  Burn = 0,
  Redeem = 1,
}

export interface PackVoucherData {
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
}

const packVoucherStruct = borsh.struct<PackVoucherData>(
  [
    ['accountType', 'u8'],
    ['packSet', 'pubkeyAsString'],
    ['master', 'pubkeyAsString'],
    ['metadata', 'pubkeyAsString'],
    ['tokenAccount', 'pubkeyAsString'],
    ['maxSupply', { kind: 'option', type: 'u32' }],
    ['currentSupply', 'u32'],
    ['numberToOpen', 'u32'],
    ['actionOnProve', 'u8'],
  ],
  [],
  (data) => {
    data.accountType = NFTPacksAccountType.PackVoucher;
    return data;
  },
);

export class PackVoucher extends Account<PackVoucherData> {
  static readonly PREFIX = 'voucher';

  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!PackVoucher.isPackVoucher(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = packVoucherStruct.deserialize(this.info.data);
  }

  static isPackVoucher(data: Buffer) {
    return data[0] === NFTPacksAccountType.PackVoucher;
  }

  static getPDA(packSet: AnyPublicKey, index: number) {
    return Program.findProgramAddress([
      Buffer.from(PackVoucher.PREFIX),
      new PublicKey(packSet).toBuffer(),
      Buffer.from(index.toString()),
    ]);
  }
}

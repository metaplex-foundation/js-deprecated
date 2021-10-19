import { AccountInfo, PublicKey } from '@solana/web3.js';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '@metaplex/errors';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Borsh } from '@metaplex/utils';
import { Account } from '../../../Account';
import { NFTPacksAccountType, NFTPacksProgram } from '../NFTPacksProgram';
import { Buffer } from 'buffer';

type Args = {
  userWallet: StringPublicKey;
  packSet: StringPublicKey;
  provedVouchers: number;
  provedVoucherEditions: number;
  claimedCards: number;
  claimedCardEditions: number;
};
export class ProvingProcessData extends Borsh.Data<Args> {
  static readonly SCHEMA = this.struct([
    ['accountType', 'u8'],
    ['userWallet', 'pubkeyAsString'],
    ['packSet', 'pubkeyAsString'],
    ['provedVouchers', 'u32'],
    ['provedVoucherEditions', 'u32'],
    ['claimedCards', 'u32'],
    ['claimedCardEditions', 'u32'],
  ]);

  accountType: NFTPacksAccountType;
  /// User wallet
  userWallet: StringPublicKey;
  /// Pack set
  packSet: StringPublicKey;
  /// Counter of proved vouchers
  provedVouchers: number;
  /// Counter of proved editions of each voucher master
  provedVoucherEditions: number;
  /// Counter of claimed cards
  claimedCards: number;
  /// Counter of claimed editions of each pack card
  claimedCardEditions: number;

  constructor(args: Args) {
    super(args);
    this.accountType = NFTPacksAccountType.ProvingProcess;
  }
}

export class ProvingProcess extends Account<ProvingProcessData> {
  static readonly PREFIX = 'proving';

  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(NFTPacksProgram.PUBKEY)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!ProvingProcess.isCompatible(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = ProvingProcessData.deserialize(this.info.data);
  }

  static isCompatible(data: Buffer) {
    return data[0] === NFTPacksAccountType.ProvingProcess;
  }

  static getPDA(packSet: AnyPublicKey, userWallet: AnyPublicKey) {
    return NFTPacksProgram.findProgramAddress([
      Buffer.from(ProvingProcess.PREFIX),
      new PublicKey(packSet).toBuffer(),
      new PublicKey(userWallet).toBuffer(),
    ]);
  }
}

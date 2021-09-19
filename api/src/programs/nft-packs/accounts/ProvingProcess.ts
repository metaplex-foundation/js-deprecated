import { AccountInfo, PublicKey } from '@solana/web3.js';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '@metaplex/errors';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { borsh } from '@metaplex/utils';
import { Account } from '../../../Account';
import Program, { NFTPacksAccountType } from '../NFTPacksProgram';
import { Buffer } from 'buffer';

export interface ProvingProcessData {
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
}

const provingProcessStruct = borsh.struct<ProvingProcessData>(
  [
    ['accountType', 'u8'],
    ['userWallet', 'pubkeyAsString'],
    ['packSet', 'pubkeyAsString'],
    ['provedVouchers', 'u32'],
    ['provedVoucherEditions', 'u32'],
    ['claimedCards', 'u32'],
    ['claimedCardEditions', 'u32'],
  ],
  [],
  (data) => {
    data.accountType = NFTPacksAccountType.ProvingProcess;
    return data;
  },
);

export class ProvingProcess extends Account<ProvingProcessData> {
  static readonly PREFIX = 'proving';

  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!ProvingProcess.isCompatible(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = provingProcessStruct.deserialize(this.info.data);
  }

  static isCompatible(data: Buffer) {
    return data[0] === NFTPacksAccountType.ProvingProcess;
  }

  static getPDA(packSet: AnyPublicKey, userWallet: AnyPublicKey) {
    return Program.findProgramAddress([
      Buffer.from(ProvingProcess.PREFIX),
      new PublicKey(packSet).toBuffer(),
      new PublicKey(userWallet).toBuffer(),
    ]);
  }
}

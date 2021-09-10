import { AccountInfo, PublicKey } from '@solana/web3.js';
import { AnyPublicKey, StringPublicKey } from '../../types';
import { borsh } from '../../utils';
import { Account } from '../Account';
import Program, { VaultKey, VaultProgram } from './VaultProgram';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '../../errors';

export interface SafetyDepositBoxData {
  /// Each token type in a vault has it's own box that contains it's mint and a look-back
  key: VaultKey;
  /// VaultKey pointing to the parent vault
  vault: StringPublicKey;
  /// This particular token's mint
  tokenMint: StringPublicKey;
  /// Account that stores the tokens under management
  store: StringPublicKey;
  /// the order in the array of registries
  order: number;
}

const safetyDepositStruct = borsh.struct<SafetyDepositBoxData>(
  [
    ['key', 'u8'],
    ['vault', 'pubkeyAsString'],
    ['tokenMint', 'pubkeyAsString'],
    ['store', 'pubkeyAsString'],
    ['order', 'u8'],
  ],
  [],
  (data) => {
    data.key = VaultKey.SafetyDepositBoxV1;
    return data;
  },
);

export class SafetyDepositBox extends Account<SafetyDepositBoxData> {
  constructor(key: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(key, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!SafetyDepositBox.isSafetyDepositBox(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = safetyDepositStruct.deserialize(this.info.data);
  }

  static async getPDA(vault: AnyPublicKey, mint: AnyPublicKey) {
    return Program.findProgramAddress([
      Buffer.from(VaultProgram.PREFIX),
      new PublicKey(vault).toBuffer(),
      new PublicKey(mint).toBuffer(),
    ]);
  }

  static isSafetyDepositBox(data: Buffer) {
    return data[0] === VaultKey.SafetyDepositBoxV1;
  }
}

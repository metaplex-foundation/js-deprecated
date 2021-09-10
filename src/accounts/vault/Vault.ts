import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import bs58 from 'bs58';
import { Account } from '../Account';
import { AnyPublicKey, StringPublicKey } from '../../types';
import { borsh } from '../../utils';
import { SafetyDepositBox } from './SafetyDepositBox';
import Program, { VaultKey, VaultProgram } from './VaultProgram';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '../../errors';

export enum VaultState {
  Inactive = 0,
  Active = 1,
  Combined = 2,
  Deactivated = 3,
}

export interface VaultData {
  key: VaultKey;
  /// Store token program used
  tokenProgram: StringPublicKey;
  /// Mint that produces the fractional shares
  fractionMint: StringPublicKey;
  /// Authority who can make changes to the vault
  authority: StringPublicKey;
  /// treasury where fractional shares are held for redemption by authority
  fractionTreasury: StringPublicKey;
  /// treasury where monies are held for fractional share holders to redeem(burn) shares once buyout is made
  redeemTreasury: StringPublicKey;
  /// Can authority mint more shares from fraction_mint after activation
  allowFurtherShareCreation: boolean;

  /// Must point at an ExternalPriceAccount, which gives permission and price for buyout.
  pricingLookupAddress: StringPublicKey;
  /// In inactive state, we use this to set the order key on Safety Deposit Boxes being added and
  /// then we increment it and save so the next safety deposit box gets the next number.
  /// In the Combined state during token redemption by authority, we use it as a decrementing counter each time
  /// The authority of the vault withdrawals a Safety Deposit contents to count down how many
  /// are left to be opened and closed down. Once this hits zero, and the fraction mint has zero shares,
  /// then we can deactivate the vault.
  tokenTypeCount: number;
  state: VaultState;

  /// Once combination happens, we copy price per share to vault so that if something nefarious happens
  /// to external price account, like price change, we still have the math 'saved' for use in our calcs
  lockedPricePerShare: BN;
}

const vaultStruct = borsh.struct<VaultData>(
  [
    ['key', 'u8'],
    ['tokenProgram', 'pubkeyAsString'],
    ['fractionMint', 'pubkeyAsString'],
    ['authority', 'pubkeyAsString'],
    ['fractionTreasury', 'pubkeyAsString'],
    ['redeemTreasury', 'pubkeyAsString'],
    ['allowFurtherShareCreation', 'u8'],
    ['pricingLookupAddress', 'pubkeyAsString'],
    ['tokenTypeCount', 'u8'],
    ['state', 'u8'],
    ['lockedPricePerShare', 'u64'],
  ],
  [],
  (data) => {
    data.key = VaultKey.VaultV1;
    return data;
  },
);

export class Vault extends Account<VaultData> {
  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!Vault.isVault(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = vaultStruct.deserialize(this.info.data);
  }

  static async getPDA(pubkey: AnyPublicKey) {
    return Program.findProgramAddress([
      Buffer.from(VaultProgram.PREFIX),
      VaultProgram.PUBKEY.toBuffer(),
      new PublicKey(pubkey).toBuffer(),
    ]);
  }

  static isVault(data: Buffer) {
    return data[0] === VaultKey.VaultV1;
  }

  async getSafetyDepositBoxes(connection: Connection) {
    return (
      await Program.getProgramAccounts(connection, {
        filters: [
          // Filter for SafetyDepositBoxV1 by key
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(Buffer.from([VaultKey.SafetyDepositBoxV1])),
            },
          },
          // Filter for assigned to this vault
          {
            memcmp: {
              offset: 1,
              bytes: this.pubkey.toBase58(),
            },
          },
        ],
      })
    ).map((account) => SafetyDepositBox.from(account));
  }
}

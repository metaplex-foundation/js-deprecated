import { AccountInfo, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import { PackCard } from './PackCard';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '@metaplex/errors';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Borsh } from '@metaplex/utils';
import { Account } from '../../../Account';
import { NFTPacksAccountType, NFTPacksProgram } from '../NFTPacksProgram';
import { Buffer } from 'buffer';

export enum PackSetState {
  NotActivated = 0,
  Activated = 1,
  Deactivated = 2,
}

type Args = {
  name: string;
  authority: StringPublicKey;
  mintingAuthority: StringPublicKey;
  totalPacks: number;
  packCards: number;
  packVouchers: number;
  mutable: boolean;
  state: PackSetState;
};
export class PackSetData extends Borsh.Data<Args> {
  static readonly SCHEMA = this.struct([
    ['accountType', 'u8'],
    ['name', [32]],
    ['authority', 'pubkeyAsString'],
    ['mintingAuthority', 'pubkeyAsString'],
    ['totalPacks', 'u32'],
    ['packCards', 'u32'],
    ['packVouchers', 'u32'],
    ['mutable', 'u8'],
    ['state', 'u8'],
  ]);

  accountType: NFTPacksAccountType;
  /// Name
  name: string;
  /// Pack authority
  authority: StringPublicKey;
  /// Authority to mint voucher editions
  mintingAuthority: StringPublicKey;
  /// How many packs are available for redeeming
  totalPacks: number;
  /// Card masters counter
  packCards: number;
  /// Pack voucher counter
  packVouchers: number;
  /// If true authority can make changes at deactivated phase
  mutable: boolean;
  /// Pack state
  state: PackSetState;

  constructor(args: Args) {
    super(args);
    this.accountType = NFTPacksAccountType.PackSet;
    // Fixed Uint8Array to utf-8 string
    this.name = String.fromCharCode.apply(null, args.name).replace(/\0.*$/g, '');
    this.state = args.state as PackSetState;
  }
}

export class PackSet extends Account<PackSetData> {
  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(NFTPacksProgram.PUBKEY)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!PackSet.isCompatible(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = PackSetData.deserialize(this.info.data);
  }

  static isCompatible(data: Buffer) {
    return data[0] === NFTPacksAccountType.PackSet;
  }

  async getCards(connection: Connection) {
    return (
      await NFTPacksProgram.getProgramAccounts(connection, {
        filters: [
          // Filter for PackCard by key
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(Buffer.from([NFTPacksAccountType.PackCard])),
            },
          },
          // Filter for assigned to this pack set
          {
            memcmp: {
              offset: 1,
              bytes: this.pubkey.toBase58(),
            },
          },
        ],
      })
    ).map((account) => PackCard.from(account));
  }
}

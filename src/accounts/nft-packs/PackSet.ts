import { AccountInfo, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import { PackCard } from './PackCard';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '../../errors';
import { AnyPublicKey, StringPublicKey } from '../../types';
import { borsh } from '../../utils';
import { Account } from '../Account';
import Program, { NFTPacksAccountType } from './NFTPacksProgram';

export enum PackSetState {
  NotActivated = 0,
  Activated = 1,
  Deactivated = 2,
}

export interface PackSetData {
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
}

const packSetStruct = borsh.struct<PackSetData>(
  [
    ['accountType', 'u8'],
    ['name', [32]],
    ['authority', 'pubkeyAsString'],
    ['mintingAuthority', 'pubkeyAsString'],
    ['totalPacks', 'u32'],
    ['packCards', 'u32'],
    ['packVouchers', 'u32'],
    ['mutable', 'u8'],
    ['state', 'u8'],
  ],
  [],
  (data) => {
    data.accountType = NFTPacksAccountType.PackSet;
    data.name = String.fromCharCode.apply(null, data.name);
    data.state = data.state as PackSetState;
    return data;
  },
);

export class PackSet extends Account<PackSetData> {
  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!PackSet.isPackSet(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = packSetStruct.deserialize(this.info.data);
  }

  static isPackSet(data: Buffer) {
    return data[0] === NFTPacksAccountType.PackSet;
  }

  async getCards(connection: Connection) {
    return (
      await Program.getProgramAccounts(connection, {
        filters: [
          // Filter for EditionV1 by key
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

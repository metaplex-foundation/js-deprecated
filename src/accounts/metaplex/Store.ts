import { AnyPublicKey, StringPublicKey } from '../../types';
import { borsh } from '../../utils';
import { MetaplexProgram, MetaplexKey } from './MetaplexProgram';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { WhitelistedCreator } from './WhitelistedCreator';

export interface StoreData {
  key: MetaplexKey;
  public: boolean;
  auctionProgram: StringPublicKey;
  tokenVaultProgram: StringPublicKey;
  tokenMetadataProgram: StringPublicKey;
  tokenProgram: StringPublicKey;
}

const storeStruct = borsh.struct<StoreData>(
  [
    ['key', 'u8'],
    ['public', 'u8'],
    ['auctionProgram', 'pubkeyAsString'],
    ['tokenVaultProgram', 'pubkeyAsString'],
    ['tokenMetadataProgram', 'pubkeyAsString'],
    ['tokenProgram', 'pubkeyAsString'],
  ],
  [],
  (data) => Object.assign({ public: true }, data, { key: MetaplexKey.StoreV1 }),
);

export class Store extends MetaplexProgram<StoreData> {
  constructor(pubkey: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (this.info && this.isOwner() && Store.isStore(this.info.data)) {
      this.data = storeStruct.deserialize(this.info.data);
    }
  }

  static isStore(data: Buffer) {
    return data[0] === MetaplexKey.StoreV1;
  }

  static async getPDA(ownerAddress: AnyPublicKey) {
    return MetaplexProgram.findProgramAddress(
      [
        Buffer.from(MetaplexProgram.PREFIX),
        MetaplexProgram.PUBKEY.toBuffer(),
        new PublicKey(ownerAddress).toBuffer(),
      ],
      MetaplexProgram.PUBKEY,
    );
  }

  // TODO: we need some filter for current store
  async getWhitelistedCreators(connection: Connection) {
    const accounts = await this.getProgramAccounts(connection, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(Buffer.from([MetaplexKey.WhitelistedCreatorV1])),
          },
        },
      ],
    });

    // const creators = ...

    return accounts.map(({ pubkey, account }) => new WhitelistedCreator(pubkey, account));
  }
}

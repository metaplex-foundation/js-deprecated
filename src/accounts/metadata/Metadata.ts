import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { AnyPublicKey, StringPublicKey } from '../../types';
import { borsh } from '../../utils';
import { Account } from '../Account';
import { Edition } from './Edition';
import { MasterEdition } from './MasterEdition';
import { MetadataKey, MetadataProgram } from './MetadataProgram';

export interface Creator {
  address: StringPublicKey;
  verified: boolean;
  share: number;
}

const creatorStruct = borsh.struct<Creator>([
  ['address', 'pubkeyAsString'],
  ['verified', 'u8'],
  ['share', 'u8'],
]);

export interface MetadataDataData {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Creator[] | null;
}

const dataDataStruct = borsh.struct<MetadataDataData>(
  [
    ['name', 'string'],
    ['symbol', 'string'],
    ['uri', 'string'],
    ['sellerFeeBasisPoints', 'u16'],
    ['creators', { kind: 'option', type: [creatorStruct.type] }],
  ],
  [creatorStruct],
  (data) => {
    const METADATA_REPLACE = new RegExp('\u0000', 'g');
    data.name = data.name.replace(METADATA_REPLACE, '');
    data.uri = data.uri.replace(METADATA_REPLACE, '');
    data.symbol = data.symbol.replace(METADATA_REPLACE, '');
    return data;
  },
);

export interface MetadataData {
  key: MetadataKey;
  updateAuthority: StringPublicKey;
  mint: StringPublicKey;
  data: MetadataDataData;
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce: number | null;

  // set lazy - TODO - remove?
  masterEdition?: StringPublicKey;
  edition?: StringPublicKey;
}

const dataStruct = borsh.struct<MetadataData>(
  [
    ['key', 'u8'],
    ['updateAuthority', 'pubkeyAsString'],
    ['mint', 'pubkeyAsString'],
    ['data', dataDataStruct.type],
    ['primarySaleHappened', 'u8'], // bool
    ['isMutable', 'u8'], // bool
  ],
  [dataDataStruct],
);

export class Metadata extends MetadataProgram<MetadataData> {
  constructor(pubkey: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (this.info && this.isOwner() && Metadata.isMetadata(this.info.data)) {
      this.data = dataStruct.deserialize(this.info.data);
    }
  }

  static isMetadata(data: Buffer) {
    return data[0] === MetadataKey.MetadataV1;
  }

  static async getPDA(mint: AnyPublicKey) {
    return Metadata.findProgramAddress(
      [
        Buffer.from(MetadataProgram.PREFIX),
        MetadataProgram.PUBKEY.toBuffer(),
        new PublicKey(mint).toBuffer(),
      ],
      MetadataProgram.PUBKEY,
    );
  }

  async getEdition(connection: Connection) {
    const mint = this.data?.mint;
    if (!mint) return;

    const pda = await Edition.getPDA(mint);
    const info = await Account.getInfo(connection, pda);
    const key = info?.data[0];

    switch (key) {
      case MetadataKey.EditionV1:
        return new Edition(pda, info);
      case MetadataKey.MasterEditionV1:
      case MetadataKey.MasterEditionV2:
        return new MasterEdition(pda, info);
      default:
        return;
    }
  }
}

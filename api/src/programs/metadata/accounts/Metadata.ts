import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '@metaplex/errors';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Borsh } from '@metaplex/utils';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { Account } from '../../../Account';
import { TokenAccount } from '../../shared';
import { MetadataKey, MetadataProgram } from '../MetadataProgram';
import { Edition } from './Edition';
import { MasterEdition } from './MasterEdition';

type CreatorArgs = { address: StringPublicKey; verified: boolean; share: number };
export class Creator extends Borsh.Data<CreatorArgs> {
  static readonly SCHEMA = this.struct([
    ['address', 'pubkeyAsString'],
    ['verified', 'u8'],
    ['share', 'u8'],
  ]);

  address: StringPublicKey;
  verified: boolean;
  share: number;
}

type DataArgs = {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Creator[] | null;
};
export class MetadataDataData extends Borsh.Data<DataArgs> {
  static readonly SCHEMA = new Map([
    ...Creator.SCHEMA,
    ...this.struct([
      ['name', 'string'],
      ['symbol', 'string'],
      ['uri', 'string'],
      ['sellerFeeBasisPoints', 'u16'],
      ['creators', { kind: 'option', type: Creator }],
    ]),
  ]);

  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Creator[] | null;

  constructor(args: DataArgs) {
    super(args);

    const METADATA_REPLACE = new RegExp('\u0000', 'g');
    this.name = args.name.replace(METADATA_REPLACE, '');
    this.uri = args.uri.replace(METADATA_REPLACE, '');
    this.symbol = args.symbol.replace(METADATA_REPLACE, '');
  }
}

type Args = {
  updateAuthority: StringPublicKey;
  mint: StringPublicKey;
  data: MetadataDataData;
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce: number | null;
};
export class MetadataData extends Borsh.Data<Args> {
  static readonly SCHEMA = new Map([
    ...MetadataDataData.SCHEMA,
    ...this.struct([
      ['key', 'u8'],
      ['updateAuthority', 'pubkeyAsString'],
      ['mint', 'pubkeyAsString'],
      ['data', MetadataDataData],
      ['primarySaleHappened', 'u8'], // bool
      ['isMutable', 'u8'], // bool
    ]),
  ]);

  key: MetadataKey;
  updateAuthority: StringPublicKey;
  mint: StringPublicKey;
  data: MetadataDataData;
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce: number | null;

  // set lazy
  masterEdition?: StringPublicKey;
  edition?: StringPublicKey;

  constructor(args: Args) {
    super(args);
    this.key = MetadataKey.MetadataV1;
  }
}

export class Metadata extends Account<MetadataData> {
  constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (!this.assertOwner(MetadataProgram.PUBKEY)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!Metadata.isCompatible(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = MetadataData.deserialize(this.info.data);
  }

  static isCompatible(data: Buffer) {
    return data[0] === MetadataKey.MetadataV1;
  }

  static async getPDA(mint: AnyPublicKey) {
    return MetadataProgram.findProgramAddress([
      Buffer.from(MetadataProgram.PREFIX),
      MetadataProgram.PUBKEY.toBuffer(),
      new PublicKey(mint).toBuffer(),
    ]);
  }

  static async getAll(connection: Connection) {
    return (
      await MetadataProgram.getProgramAccounts(connection, {
        filters: [
          // Filter for MetadataV1 by key
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(Buffer.from([MetadataKey.MetadataV1])),
            },
          },
        ],
      })
    ).map((account) => Metadata.from(account));
  }

  static async getByMint(connection: Connection, mint: AnyPublicKey) {
    return (
      await MetadataProgram.getProgramAccounts(connection, {
        filters: [
          // Filter for MetadataV1 by key
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(Buffer.from([MetadataKey.MetadataV1])),
            },
          },
          // Filter for assigned to mint
          {
            memcmp: {
              offset: 33,
              bytes: new PublicKey(mint).toBase58(),
            },
          },
        ],
      })
    ).map((account) => Metadata.from(account));
  }

  static async getMetdataByOwner(connection: Connection, owner: AnyPublicKey) {
    const accounts = await TokenAccount.getTokenAccountsByOwner(connection, owner);
    const accountMap = new Map(accounts.map(({ data }) => [data.mint.toString(), data]));
    const allMetadata = await Metadata.getAll(connection);

    return allMetadata.filter(
      (metadata) =>
        accountMap.has(metadata.data.mint) &&
        (accountMap?.get(metadata.data.mint)?.amount?.toNumber() || 0) > 0,
    );
  }

  // TODO: lol
  static async getMetdataByOwnerV2(connection: Connection, owner: AnyPublicKey) {
    const accounts = await TokenAccount.getTokenAccountsByOwner(connection, owner);
    const accountsWithAmount = accounts
      .map(({ data }) => data)
      .filter(({ amount }) => amount?.toNumber() > 0);

    return (
      await Promise.all(accountsWithAmount.map(({ mint }) => Metadata.getByMint(connection, mint)))
    ).flat();
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

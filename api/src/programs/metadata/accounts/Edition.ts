import { borsh } from '@metaplex/utils';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import Program, { MetadataProgram, MetadataKey } from '../MetadataProgram';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Account } from '../../../Account';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '@metaplex/errors';
import { Buffer } from 'buffer';

export interface EditionData {
  key: MetadataKey;
  parent: StringPublicKey;
  edition: BN;
}

const editionStruct = borsh.struct<EditionData>(
  [
    ['key', 'u8'],
    ['parent', 'pubkeyAsString'],
    ['edition', 'u64'],
  ],
  [],
  (data) => {
    data.key = MetadataKey.EditionV1;
    return data;
  },
);

export class Edition extends Account<EditionData> {
  static readonly EDITION_PREFIX = 'edition';

  constructor(key: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(key, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!Edition.isCompatible(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = editionStruct.deserialize(this.info.data);
  }

  static async getPDA(mint: AnyPublicKey) {
    return Program.findProgramAddress([
      Buffer.from(MetadataProgram.PREFIX),
      MetadataProgram.PUBKEY.toBuffer(),
      new PublicKey(mint).toBuffer(),
      Buffer.from(Edition.EDITION_PREFIX),
    ]);
  }

  static isCompatible(data: Buffer) {
    return data[0] === MetadataKey.EditionV1;
  }
}

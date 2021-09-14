import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { ERROR_INVALID_ACCOUNT_DATA, ERROR_INVALID_OWNER } from '../../errors';
import { AnyPublicKey } from '../../types';
import { borsh } from '../../utils';
import { Account } from '../Account';
import { Edition } from './Edition';
import Program, { MetadataKey, MetadataProgram } from './MetadataProgram';

export interface EditionMarkerData {
  key: MetadataKey;
  ledger: number[];
}

const editionMarkerStruct = borsh.struct<EditionMarkerData>(
  [
    ['key', 'u8'],
    ['ledger', [31]],
  ],
  [],
  (data) => {
    data.key = MetadataKey.EditionMarker;
    return data;
  },
);

export class EditionMarker extends Account<EditionMarkerData> {
  constructor(key: AnyPublicKey, info: AccountInfo<Buffer>) {
    super(key, info);

    if (!this.assertOwner(Program.pubkey)) {
      throw ERROR_INVALID_OWNER();
    }

    if (!EditionMarker.isEditionMarker(this.info.data)) {
      throw ERROR_INVALID_ACCOUNT_DATA();
    }

    this.data = editionMarkerStruct.deserialize(this.info.data);
  }

  static async getPDA(mint: AnyPublicKey, edition: BN) {
    const editionNumber = Math.floor(edition.toNumber() / 248);

    return Program.findProgramAddress([
      Buffer.from(MetadataProgram.PREFIX),
      MetadataProgram.PUBKEY.toBuffer(),
      new PublicKey(mint).toBuffer(),
      Buffer.from(Edition.EDITION_PREFIX),
      Buffer.from(editionNumber.toString()),
    ]);
  }

  static isEditionMarker(data: Buffer) {
    return data[0] === MetadataKey.EditionMarker;
  }
}

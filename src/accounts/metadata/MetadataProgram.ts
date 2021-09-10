import { PublicKey } from '@solana/web3.js';
import { Program } from '../Program';

export enum MetadataKey {
  Uninitialized = 0,
  MetadataV1 = 4,
  EditionV1 = 1,
  MasterEditionV1 = 2,
  MasterEditionV2 = 6,
  EditionMarker = 7,
}

export class MetadataProgram extends Program<{}> {
  static readonly PREFIX = 'metadata';
  static readonly PUBKEY = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

  constructor() {
    super(MetadataProgram.PUBKEY);
  }
}

export default new MetadataProgram();

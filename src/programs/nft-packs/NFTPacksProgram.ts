import { PublicKey } from '@solana/web3.js';
import { config } from '../../config';
import { Program } from '../../Program';

export enum NFTPacksAccountType {
  Uninitialized = 0,
  PackSet = 1,
  PackCard = 2,
  PackVoucher = 3,
  ProvingProcess = 4,
}

export class NFTPacksProgram extends Program {
  static readonly PREFIX = 'packs';
  static readonly PUBKEY = new PublicKey(config.programs.packs);
}

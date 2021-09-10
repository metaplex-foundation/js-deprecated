import { PublicKey } from '@solana/web3.js';
import { Program } from '../Program';

export enum VaultKey {
  Uninitialized = 0,
  VaultV1 = 3,
  SafetyDepositBoxV1 = 1,
  ExternalPriceAccountV1 = 2,
}

export class VaultProgram extends Program<{}> {
  static readonly PREFIX = 'vault';
  static readonly PUBKEY = new PublicKey('vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn');

  constructor() {
    super(VaultProgram.PUBKEY);
  }
}

export default new VaultProgram();

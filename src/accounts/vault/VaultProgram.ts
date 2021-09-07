import { Program } from "../Program";
import { PublicKey } from "@solana/web3.js";

export enum VaultKey {
  Uninitialized = 0,
  VaultV1 = 3,
  SafetyDepositBoxV1 = 1,
  ExternalPriceAccountV1 = 2,
}

export class VaultProgram<T> extends Program<T> {
  static readonly PREFIX = "vault";
  static readonly PUBKEY = new PublicKey(
    "vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn"
  );

  isOwner() {
    return this.info?.owner.equals(VaultProgram.PUBKEY);
  }
}

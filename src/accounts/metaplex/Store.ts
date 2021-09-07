import { AnyPublicKey, StringPublicKey } from "../../types";
import { borsh } from "../../utils";
import { MetaplexProgram, MetaplexKey } from "./MetaplexProgram";
import { AccountInfo } from "@solana/web3.js";

const struct = borsh.Struct.create;

export interface StoreData {
  key: MetaplexKey;
  public: boolean;
  auctionProgram: StringPublicKey;
  tokenVaultProgram: StringPublicKey;
  tokenMetadataProgram: StringPublicKey;
  tokenProgram: StringPublicKey;
}

const storeStruct = struct<StoreData>(
  [
    ["key", "u8"],
    ["public", "u8"],
    ["auctionProgram", "pubkeyAsString"],
    ["tokenVaultProgram", "pubkeyAsString"],
    ["tokenMetadataProgram", "pubkeyAsString"],
    ["tokenProgram", "pubkeyAsString"],
  ],
  [],
  (data) => Object.assign({ public: true }, data, { key: MetaplexKey.StoreV1 })
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
}

import { AnyPublicKey, StringPublicKey } from "../../types";
import { borsh } from "../../utils";
import { MetaplexProgram, MetaplexKey } from "./MetaplexProgram";
import { AccountInfo } from "@solana/web3.js";

const struct = borsh.Struct.create;

export interface WhitelistedCreatorData {
  key: MetaplexKey;
  address: StringPublicKey;
  activated: boolean;
}

const whitelistedCreatorStruct = struct<WhitelistedCreatorData>(
  [
    ["key", "u8"],
    ["address", "pubkeyAsString"],
    ["activated", "u8"],
  ],
  [],
  (data) =>
    Object.assign({ activated: true }, data, {
      key: MetaplexKey.WhitelistedCreatorV1,
    })
);

export class WhitelistedCreator extends MetaplexProgram<WhitelistedCreatorData> {
  constructor(pubkey: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (
      this.info &&
      this.isOwner() &&
      WhitelistedCreator.isWhitelistedCreator(this.info.data)
    ) {
      this.data = whitelistedCreatorStruct.deserialize(this.info.data);
    }
  }

  static isWhitelistedCreator(data: Buffer) {
    return data[0] === MetaplexKey.WhitelistedCreatorV1;
  }
}

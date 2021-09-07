import { borsh } from "../../utils";
import { AnyPublicKey, StringPublicKey } from "../../types";
import { MetadataProgram, MetadataKey } from "./MetadataProgram";
import { AccountInfo } from "@solana/web3.js";
import BN from "bn.js";

const struct = borsh.Struct.create;

export interface EditionData {
  key: MetadataKey;
  parent: StringPublicKey;
  edition: BN;
}

const editionStruct = struct<EditionData>(
  [
    ["key", "u8"],
    ["parent", "pubkeyAsString"],
    ["edition", "u64"],
  ],
  [],
  (data) => {
    data.key = MetadataKey.EditionV1;
    return data;
  }
);

export class Edition extends MetadataProgram<EditionData> {
  static readonly EDITION_PREFIX = "edition";

  constructor(key: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(key, info);

    if (this.info && this.isOwner() && Edition.isEdition(this.info.data)) {
      this.data = editionStruct.deserialize(this.info.data);
    }
  }

  static async getPDA(mint?: AnyPublicKey) {
    if (!mint) return;
    return await Edition.findProgramAddress(
      [
        Buffer.from(this.PREFIX),
        this.PUBKEY.toBuffer(),
        Edition.toPublicKey(mint).toBuffer(),
        Buffer.from(Edition.EDITION_PREFIX),
      ],
      this.PUBKEY
    );
  }

  static isEdition(data: Buffer) {
    return data[0] === MetadataKey.EditionV1;
  }
}

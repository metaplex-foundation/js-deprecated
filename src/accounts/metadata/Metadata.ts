import { AnyPublicKey, StringPublicKey } from "../../types";
import { borsh } from "../../utils";
import { MetadataProgram, MetadataKey } from "./MetadataProgram";
import { Account } from "../Account";
import { MasterEdition } from "./MasterEdition";
import { Edition } from "./Edition";
import { AccountInfo, Connection } from "@solana/web3.js";

const struct = borsh.Struct.create;

export interface Creator {
  address: StringPublicKey;
  verified: boolean;
  share: number;
}

const creatorStruct = struct<Creator>([
  ["address", "pubkeyAsString"],
  ["verified", "u8"],
  ["share", "u8"],
]);

export interface MetadataDataData {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Creator[] | null;
}

const dataDataStruct = struct<MetadataDataData>(
  [
    ["name", "string"],
    ["symbol", "string"],
    ["uri", "string"],
    ["sellerFeeBasisPoints", "u16"],
    ["creators", { kind: "option", type: [creatorStruct.type] }],
  ],
  [creatorStruct],
  (data) => {
    const METADATA_REPLACE = new RegExp("\u0000", "g");
    data.name = data.name.replace(METADATA_REPLACE, "");
    data.uri = data.uri.replace(METADATA_REPLACE, "");
    data.symbol = data.symbol.replace(METADATA_REPLACE, "");
    return data;
  }
);

export interface MetadataData {
  key: MetadataKey;
  updateAuthority: StringPublicKey;
  mint: StringPublicKey;
  data: MetadataDataData;
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce: number | null;

  // set lazy - TODO - remove?
  masterEdition?: StringPublicKey;
  edition?: StringPublicKey;
}

const dataStruct = struct<MetadataData>(
  [
    ["key", "u8"],
    ["updateAuthority", "pubkeyAsString"],
    ["mint", "pubkeyAsString"],
    ["data", dataDataStruct.type],
    ["primarySaleHappened", "u8"], // bool
    ["isMutable", "u8"], // bool
  ],
  [dataDataStruct]
);

export class Metadata extends MetadataProgram<MetadataData> {
  constructor(pubkey: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (this.info && this.isOwner() && Metadata.isMetadata(this.info.data)) {
      this.data = dataStruct.deserialize(this.info.data);
    }
  }

  async getEdition(connection: Connection) {
    const mint = this.data?.mint;
    if (!mint) return;
    const pda = await Edition.getPDA(mint);
    if (!pda) return;
    const info = await Account.getInfo(connection, pda);
    const key = info?.data[0];
    if (key === MetadataKey.EditionV1) {
      return new Edition(pda, info);
    } else if (
      key === MetadataKey.MasterEditionV1 ||
      key === MetadataKey.MasterEditionV2
    ) {
      return new MasterEdition(pda, info);
    }
    return;
  }

  async getPDA() {
    if (!this.data?.mint) return;
    return await Metadata.findProgramAddress(
      [
        Buffer.from(MetadataProgram.PREFIX),
        MetadataProgram.PUBKEY.toBuffer(),
        Metadata.toPublicKey(this.data?.mint).toBuffer(),
      ],
      MetadataProgram.PUBKEY
    );
  }

  static isMetadata(data: Buffer) {
    return data[0] === MetadataKey.MetadataV1;
  }
}

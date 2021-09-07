import {
  AccountInfo,
  Commitment,
  PublicKey,
  Connection,
} from "@solana/web3.js";
import { AnyPublicKey } from "../types";

export type AccountConstructor<T> = {
  new (pubkey: AnyPublicKey, info?: AccountInfo<Buffer>): T;
};

export class Account<T> {
  readonly pubkey: PublicKey;
  readonly info?: AccountInfo<Buffer>;
  data?: T;

  constructor(pubkey: AnyPublicKey, info?: AccountInfo<Buffer>) {
    this.pubkey = Account.toPublicKey(pubkey);
    if (info) {
      this.info = {
        executable: !!info.executable,
        owner: Account.toPublicKey(info.owner),
        lamports: info.lamports,
        data: Buffer.from(info.data),
      };
    }
  }

  toJSON() {
    return {
      pubkey: this.pubkey.toString(),
      info: {
        executable: !!this.info?.executable,
        owner: this.info?.owner ? Account.toPublicKey(this.info?.owner) : null,
        lamports: this.info?.lamports,
        data: this.info?.data.toJSON(),
      },
      data: this.data,
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  static toPublicKey(key: AnyPublicKey) {
    return typeof key === "string" ? new PublicKey(key) : key;
  }

  static from<T>(
    this: AccountConstructor<T>,
    pubkey: AnyPublicKey,
    info: AccountInfo<Buffer>
  ): T {
    return new this(pubkey, info);
  }

  static async load<T>(
    this: AccountConstructor<T>,
    connection: Connection,
    pubkey: AnyPublicKey
  ): Promise<T> {
    const info = await Account.getInfo(connection, pubkey);
    return new this(pubkey, info);
  }

  static async getInfo(connection: Connection, pubkey: AnyPublicKey) {
    pubkey = Account.toPublicKey(pubkey);
    const info = await connection.getAccountInfo(pubkey);
    if (!info) throw `Unable to find account: ${pubkey.toString()}`;
    return { ...info, data: Buffer.from(info?.data) };
  }

  static async getInfos(
    connection: Connection,
    pubkeys: AnyPublicKey[],
    commitment: Commitment = "recent"
  ) {
    const BATCH_SIZE = 99; // Must batch above this limit.

    const promises: Promise<
      Map<AnyPublicKey, AccountInfo<Buffer>> | undefined
    >[] = [];
    for (let i = 0; i < pubkeys.length; i += BATCH_SIZE) {
      promises.push(
        Account.getMultipleAccounts(
          connection,
          pubkeys.slice(i, Math.min(pubkeys.length, i + BATCH_SIZE)),
          commitment
        )
      );
    }

    const results = new Map<AnyPublicKey, AccountInfo<Buffer>>();
    (await Promise.all(promises)).forEach((result) =>
      [...(result?.entries() ?? [])].forEach(([k, v]) => results.set(k, v))
    );
    return results;
  }

  private static async getMultipleAccounts(
    connection: Connection,
    pubkeys: AnyPublicKey[],
    commitment: Commitment
  ) {
    const args = connection._buildArgs(
      [pubkeys.map((k) => k.toString())],
      commitment,
      "base64"
    );
    const unsafeRes = await (connection as any)._rpcRequest(
      "getMultipleAccounts",
      args
    );
    if (unsafeRes.error) {
      throw new Error(
        "failed to get info about accounts " + unsafeRes.error.message
      );
    }
    if (!unsafeRes.result.value) return;
    const infos = (unsafeRes.result.value as AccountInfo<string[]>[]).map(
      (info) => ({ ...info, data: Buffer.from(info.data[0], "base64") })
    ) as AccountInfo<Buffer>[];
    return infos.reduce((acc, info, index) => {
      acc.set(pubkeys[index], info);
      return acc;
    }, new Map<AnyPublicKey, AccountInfo<Buffer>>());
  }
}

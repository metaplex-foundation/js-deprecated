import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { Account, AccountConstructor } from "../accounts";

export abstract class Program<T> extends Account<T> {
  // abstract static readonly PREFIX: String;
  // abstract static readonly PUBKEY: PublicKey;

  static async getProgramAccounts<T>(
    this: AccountConstructor<T>,
    connection: Connection,
    ownerPubkey: PublicKey,
    extra?: any
  ): Promise<T[]> {
    const args = connection._buildArgs(
      [ownerPubkey],
      undefined,
      "base64",
      extra
    );
    try {
      const unsafeRes = await (connection as any)._rpcRequest(
        "getProgramAccounts",
        args
      );
      if (unsafeRes?.error) throw unsafeRes.error;
      const result: {
        account: AccountInfo<[string, string]>;
        pubkey: string;
      }[] = Array.isArray(unsafeRes?.result) ? unsafeRes?.result : [];
      return result.map(
        (value) =>
          new this(value.pubkey, {
            ...value.account,
            data: Buffer.from(value.account.data[0], "base64"),
          })
      );
    } catch (e) {
      throw new Error(e);
    }
  }

  static async findProgramAddress(
    seeds: (Buffer | Uint8Array)[],
    programPubkey: PublicKey
  ) {
    return (await PublicKey.findProgramAddress(seeds, programPubkey))[0];
  }
}

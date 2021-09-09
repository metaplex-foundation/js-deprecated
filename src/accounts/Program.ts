import { PublicKey, Connection } from '@solana/web3.js';
import { Account } from '../accounts';

export abstract class Program<T> extends Account<T> {
  // abstract static readonly PREFIX: String;
  // static readonly PUBKEY: PublicKey

  static async findProgramAddress(seeds: (Buffer | Uint8Array)[], programPubkey: PublicKey) {
    return (await PublicKey.findProgramAddress(seeds, programPubkey))[0];
  }

  // getProgramAccounts<T>(connection: Connection) {
  //   console.log(this.PUBKEY)

  //   // return connection.getProgramAccounts(Program.PUBKEY)
  // }

  // static async getProgramAccounts<T>(connection: Connection): Promise<T> {
  //   return connection.getProgramAccounts(Program.PUBKEY)
  // }

  // static async getProgramAccounts<T>(
  //   this: AccountConstructor<T>,
  //   connection: Connection,
  //   ownerPubkey: PublicKey,
  //   extra?: any,
  // ): Promise<T[]> {
  //   const args = connection._buildArgs([ownerPubkey], undefined, 'base64', extra)
  //   try {
  //     const unsafeRes = await (connection as any)._rpcRequest('getProgramAccounts', args)
  //     if (unsafeRes?.error) throw unsafeRes.error
  //     const result: {
  //       account: AccountInfo<[string, string]>
  //       pubkey: string
  //     }[] = Array.isArray(unsafeRes?.result) ? unsafeRes?.result : []
  //     return result.map(
  //       (value) =>
  //         new this(value.pubkey, {
  //           ...value.account,
  //           data: Buffer.from(value.account.data[0], 'base64'),
  //         }),
  //     )
  //   } catch (e) {
  //     throw new Error(e)
  //   }
  // }
}

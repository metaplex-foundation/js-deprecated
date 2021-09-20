import { PublicKey, Connection, GetProgramAccountsConfig, Commitment } from '@solana/web3.js';
import { Account } from './Account';
import { Buffer } from 'buffer';

export abstract class Program {
  static readonly PUBKEY: PublicKey;

  static async findProgramAddress(seeds: (Buffer | Uint8Array)[]) {
    return (await PublicKey.findProgramAddress(seeds, this.PUBKEY))[0];
  }

  static async getProgramAccounts(
    connection: Connection,
    configOrCommitment?: GetProgramAccountsConfig | Commitment,
  ) {
    return (await connection.getProgramAccounts(this.PUBKEY, configOrCommitment)).map(
      ({ pubkey, account }) => new Account(pubkey, account),
    );
  }
}

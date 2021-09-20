import {
  PublicKey,
  Connection,
  GetProgramAccountsConfig,
  Commitment,
  GetProgramAccountsFilter,
  Context,
} from '@solana/web3.js';
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

  static async getSubscription(
    connection: Connection,
    cb: (data: { account: Account; context: Context }) => void,
    commitment?: Commitment,
    filters?: GetProgramAccountsFilter[],
  ) {
    return connection.onProgramAccountChange(
      this.PUBKEY,
      ({ accountId, accountInfo }, context) => {
        const account = new Account(accountId, accountInfo);
        cb({ account, context });
      },
      commitment,
      filters,
    );
  }
}

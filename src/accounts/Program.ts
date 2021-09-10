import { PublicKey, Connection, GetProgramAccountsConfig, Commitment } from '@solana/web3.js';
import { Account } from './Account';

export abstract class Program<T> extends Account<T> {
  async findProgramAddress(seeds: (Buffer | Uint8Array)[]) {
    return (await PublicKey.findProgramAddress(seeds, this.pubkey))[0];
  }

  async getProgramAccounts(
    connection: Connection,
    configOrCommitment?: GetProgramAccountsConfig | Commitment,
  ) {
    return (await connection.getProgramAccounts(this.pubkey, configOrCommitment)).map(
      ({ pubkey, account }) => new Account(pubkey, account),
    );
  }
}

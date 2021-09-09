import { Program } from '../Program'
import { Commitment, Connection, GetProgramAccountsConfig, PublicKey } from '@solana/web3.js'

export class AuctionProgram<T> extends Program<T> {
  static readonly PREFIX = 'auction'
  static readonly PUBKEY = new PublicKey('auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8')

  isOwner() {
    return this.info?.owner.equals(AuctionProgram.PUBKEY)
  }

  getProgramAccounts(
    connection: Connection,
    configOrCommitment?: GetProgramAccountsConfig | Commitment,
  ) {
    return connection.getProgramAccounts(AuctionProgram.PUBKEY, configOrCommitment)
  }
}

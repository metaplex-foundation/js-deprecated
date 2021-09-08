import { Program } from '../Program'
import { PublicKey } from '@solana/web3.js'

export class AuctionProgram<T> extends Program<T> {
  static readonly PREFIX = 'auction'
  static readonly PUBKEY = new PublicKey('auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8')

  isOwner() {
    return this.info?.owner.equals(AuctionProgram.PUBKEY)
  }
}

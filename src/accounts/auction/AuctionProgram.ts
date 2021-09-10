import { PublicKey } from '@solana/web3.js';
import { Program } from '../Program';

export class AuctionProgram extends Program<{}> {
  static readonly PREFIX = 'auction';
  static readonly EXTENDED = 'extended';
  static readonly PUBKEY = new PublicKey('auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8');

  constructor() {
    super(AuctionProgram.PUBKEY);
  }
}

export default new AuctionProgram();

import { PublicKey } from '@solana/web3.js';
import { Program } from '../../accounts';

export class MemoProgram extends Program<{}> {
  static readonly PUBKEY = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

  constructor() {
    super(MemoProgram.PUBKEY);
  }
}

export default new MemoProgram();

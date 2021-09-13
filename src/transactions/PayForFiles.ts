import { Transaction } from './Transaction';
import { Keypair, PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { MemoProgram } from './programs/MemoProgram';

export class PayForFiles extends Transaction {
  constructor(
    feePayer: PublicKey,
    lamports: number,
    filesHash: Buffer,
    arweaveWallet = new PublicKey('HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm'),
  ) {
    super(
      [
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: arweaveWallet,
          lamports,
        }),
        new TransactionInstruction({
          keys: [],
          programId: MemoProgram.PUBKEY,
          data: filesHash,
        }),
      ],
      [],
    );
  }
}

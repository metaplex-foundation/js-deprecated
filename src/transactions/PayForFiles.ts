import { Transaction } from './Transaction';
import {
  PublicKey,
  SystemProgram,
  TransactionCtorFields,
  TransactionInstruction,
} from '@solana/web3.js';
import { MemoProgram } from './programs';

interface PayForFilesCtorFields extends TransactionCtorFields {
  params: {
    lamports: number;
    fileHashes: Buffer[];
    arweaveWallet?: PublicKey;
  };
}

export class PayForFiles extends Transaction {
  constructor(options: PayForFilesCtorFields) {
    const {
      feePayer,
      params: { lamports, fileHashes, arweaveWallet },
    } = options;

    super(options);

    this.add(
      SystemProgram.transfer({
        fromPubkey: feePayer,
        toPubkey: arweaveWallet ?? new PublicKey('HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm'),
        lamports,
      }),
    );

    fileHashes.forEach((data) => {
      this.add(
        new TransactionInstruction({
          keys: [],
          programId: MemoProgram.PUBKEY,
          data,
        }),
      );
    });
  }
}

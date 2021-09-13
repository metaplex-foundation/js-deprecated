import { Transaction } from './Transaction';
import {
  PublicKey,
  SystemProgram,
  TransactionCtorFields,
  TransactionInstruction,
} from '@solana/web3.js';
import { MemoProgram } from './programs';

type PayForFilesParams = {
  lamports: number;
  fileHashes: Buffer[];
  arweaveWallet?: PublicKey;
};

export class PayForFiles extends Transaction {
  constructor(options: TransactionCtorFields, params: PayForFilesParams) {
    const { feePayer } = options;
    const { lamports, fileHashes, arweaveWallet } = params;

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

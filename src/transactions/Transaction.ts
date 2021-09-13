import { Transaction as SolanaTransaction, TransactionCtorFields } from '@solana/web3.js';

export class Transaction extends SolanaTransaction {
  constructor(options: TransactionCtorFields) {
    super(options);
  }
}

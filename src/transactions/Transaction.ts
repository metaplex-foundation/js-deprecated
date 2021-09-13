import { Transaction as SolanaTransaction, TransactionCtorFields } from '@solana/web3.js';

export class Transaction extends SolanaTransaction {
  constructor(options: TransactionCtorFields) {
    super(options);
  }

  static fromCombined(transactions: Transaction[]) {
    const combinedTransaction = new Transaction({});
    transactions.forEach((transaction) =>
      transaction.instructions.forEach((instruction) => {
        combinedTransaction.add(instruction);
      }),
    );
    return combinedTransaction;
  }
}

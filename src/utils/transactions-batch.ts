import { Keypair } from '@solana/web3.js';
import { Transaction } from '../Transaction';

interface TransactionsBatchParams {
  beforeTransactions?: Transaction[];
  transactions: Transaction[];
  afterTransactions?: Transaction[];
}

export class TransactionsBatch {
  beforeTransactions: Transaction[];
  transactions: Transaction[];
  afterTransactions: Transaction[];

  signers: Keypair[] = [];

  constructor({
    beforeTransactions = [],
    transactions,
    afterTransactions = [],
  }: TransactionsBatchParams) {
    this.beforeTransactions = beforeTransactions;
    this.transactions = transactions;
    this.afterTransactions = afterTransactions;
  }

  addSigner(signer: Keypair) {
    this.signers.push(signer);
  }

  addBeforeTransaction(transaction: Transaction) {
    this.beforeTransactions.push(transaction);
  }

  addTransaction(transaction: Transaction) {
    this.transactions.push(transaction);
  }

  addAfterTransaction(transaction: Transaction) {
    this.afterTransactions.push(transaction);
  }

  toTransactions() {
    return [...this.beforeTransactions, ...this.transactions, ...this.afterTransactions];
  }

  toInstructions() {
    return [
      ...this.beforeTransactions.flatMap((t) => t.instructions),
      ...this.transactions.flatMap((t) => t.instructions),
      ...this.afterTransactions.flatMap((t) => t.instructions),
    ];
  }
}

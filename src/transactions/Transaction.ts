import { Keypair, TransactionInstruction } from '@solana/web3.js';

export class Transaction {
  protected instructions: TransactionInstruction[] = [];
  protected signers: Keypair[] = [];



}

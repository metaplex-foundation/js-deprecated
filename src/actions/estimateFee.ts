import { Keypair, PublicKey } from '@solana/web3.js';
import { Transaction } from '@metaplex-foundation/mpl-core';
import BN from 'bn.js';
import { Connection } from '../Connection';

interface Params {
  connection: Connection;
  feePayer: PublicKey;
  txs: Transaction[];
  signers?: Keypair[];
}

type Lamports = BN;

type EstimateFee = (params: Params) => Promise<Lamports>;

export const estimateFee: EstimateFee = async (params) => {
  const { connection, feePayer, txs, signers = [] } = params;

  const {
    blockhash,
    feeCalculator: { lamportsPerSignature },
  } = await connection.getRecentBlockhash();

  const tx = Transaction.fromCombined(txs, {
    feePayer,
    recentBlockhash: blockhash,
  });

  if (signers.length) {
    tx.partialSign(...signers);
  }

  const { numRequiredSignatures } = tx.compileMessage().header;

  return new BN(numRequiredSignatures * lamportsPerSignature);
};

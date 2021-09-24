import { Transaction } from '../Transaction';
import { Provider } from '../provider';
import { Keypair, SendOptions } from '@solana/web3.js';

export const sendTransaction = async (
  provider: Provider,
  txs: Transaction[],
  signers: Keypair[] = [],
  options?: SendOptions,
) => {
  const { connection, wallet } = provider;
  let tx = Transaction.fromCombined(txs, { feePayer: provider.wallet.publicKey });
  tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  if (signers.length) {
    tx.partialSign(...signers);
  }
  tx = await wallet.signTransaction(tx);

  return connection.sendRawTransaction(tx.serialize(), options);
};

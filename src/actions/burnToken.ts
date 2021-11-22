import { PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { Transaction } from '../Transaction';
import { Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';

interface IBurnTokenParams {
  connection: Connection;
  wallet: Wallet;
  token: PublicKey;
  mint: PublicKey;
  amount: number | u64;
  owner?: PublicKey;
}

interface IBurnTokenResponse {
  txId: string;
}

export const burnToken = async ({
  connection,
  wallet,
  token,
  mint,
  amount,
  owner,
}: IBurnTokenParams): Promise<IBurnTokenResponse> => {
  const tx = new Transaction({ feePayer: wallet.publicKey }).add(
    Token.createBurnInstruction(
      TOKEN_PROGRAM_ID,
      mint,
      token,
      owner ?? wallet.publicKey,
      [],
      amount,
    ),
  );

  const txId = await sendTransaction({ connection, wallet, txs: [tx] });

  return { txId };
};

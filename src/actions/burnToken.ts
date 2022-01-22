import { PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { Transaction } from '@metaplex-foundation/mpl-core';
import { Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';

export interface BurnTokenParams {
  connection: Connection;
  wallet: Wallet;
  token: PublicKey;
  mint: PublicKey;
  amount: number | u64;
  owner?: PublicKey;
  /** Set to `true` if you wish to close the token account after burning the token **/
  close?: boolean;
}

export interface BurnTokenResponse {
  txId: string;
}

export const burnToken = async ({
  connection,
  wallet,
  token,
  mint,
  amount,
  owner,
  close = true,
}: BurnTokenParams): Promise<BurnTokenResponse> => {
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

  if (close) {
    tx.add(
      Token.createCloseAccountInstruction(
        TOKEN_PROGRAM_ID,
        token,
        wallet.publicKey,
        owner ?? wallet.publicKey,
        [],
      ),
    );
  }

  const txId = await sendTransaction({ connection, wallet, txs: [tx] });

  return { txId };
};

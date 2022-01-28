import { PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { Transaction } from '@metaplex-foundation/mpl-core';
import { Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';

/** Parameters for {@link burnToken} **/
export interface BurnTokenParams {
  connection: Connection;
  /** Will be used as the fee payer and as the `owner` if none is specified. If ${@link close} is left as its' default `true` value, the `wallet` parameter will also serve as the destination wallet to refund rent exemption SOL lamports to. **/
  wallet: Wallet;
  /** The associated token account containing the tokens to be burned **/
  account: PublicKey;
  /** The mint account of the token to be burned **/
  mint: PublicKey;
  /** Amount of tokens (accounting for decimals) to burn. One important nuance to remember is that each token mint has a different amount of decimals, which need to be accounted while specifying the amount. For instance, to burn 1 token with a 0 decimal mint you would provide `1` as the amount, but for a token mint with 6 decimals you would provide `1000000` as the amount to burn one whole token **/
  amount: number | u64;
  /** The owner authority of the associated token account containing the burnt tokens **/
  owner?: PublicKey;
  /** Set to `true` if you wish to close the token account after burning the token **/
  close?: boolean;
}

export interface BurnTokenResponse {
  txId: string;
}

/**
 * Burns token of the given mint and optionally closes the associated token account. Please note that by default this action attempts to close the account after burning tokens, which will fail if not all the tokens contained in the account were burned. If you want to burn only part of the account balance, make sure you set `close` to `false`.
 */
export const burnToken = async ({
  connection,
  wallet,
  account,
  mint,
  amount,
  owner,
  close = true,
}: BurnTokenParams): Promise<BurnTokenResponse> => {
  const tx = new Transaction({ feePayer: wallet.publicKey }).add(
    Token.createBurnInstruction(
      TOKEN_PROGRAM_ID,
      mint,
      account,
      owner ?? wallet.publicKey,
      [],
      amount,
    ),
  );

  if (close) {
    tx.add(
      Token.createCloseAccountInstruction(
        TOKEN_PROGRAM_ID,
        account,
        wallet.publicKey,
        owner ?? wallet.publicKey,
        [],
      ),
    );
  }

  const txId = await sendTransaction({ connection, wallet, txs: [tx] });

  return { txId };
};

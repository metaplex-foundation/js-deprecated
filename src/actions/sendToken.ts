import { PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { Account, Transaction } from '@metaplex-foundation/mpl-core';
import { CreateAssociatedTokenAccount } from '../transactions/CreateAssociatedTokenAccount';

/** Parameters for {@link sendToken} **/
export interface SendTokenParams {
  connection: Connection;
  /** Source wallet address **/
  wallet: Wallet;
  /** Source wallet's associated token account address **/
  source: PublicKey;
  /** Destination wallet address **/
  destination: PublicKey;
  /** Mint address of the tokento transfer **/
  mint: PublicKey;
  /** Amount of tokens to transfer. One important nuance to remember is that each token mint has a different amount of decimals, which need to be accounted while specifying the amount. For instance, to send 1 token with a 0 decimal mint you would provide `1` as the amount, but for a token mint with 6 decimals you would provide `1000000` as the amount to transfer one whole token **/
  amount: number | u64;
}

export interface SendTokenResponse {
  txId: string;
}

/**
 * Send a token to another account.
 *
 * This action will do the following:
 * 1. Check if the destination account has an associated token account for the SPL token at hand
 * 2. If the associated token account doesn't exist, it will be created
 * 3. The token will be transferred to the associated token account
 *
 * Please take into account that creating an account will [automatically allocate lamports for rent exemption](https://docs.solana.com/implemented-proposals/rent) which will make it a very expensive instruction to run in bulk
 */
export const sendToken = async ({
  connection,
  wallet,
  source,
  destination,
  mint,
  amount,
}: SendTokenParams): Promise<SendTokenResponse> => {
  const txs = [];
  const destAta = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    destination,
  );
  const transactionCtorFields = {
    feePayer: wallet.publicKey,
  };

  try {
    // check if the account exists
    await Account.load(connection, destAta);
  } catch {
    txs.push(
      new CreateAssociatedTokenAccount(transactionCtorFields, {
        associatedTokenAddress: destAta,
        splTokenMintAddress: mint,
        walletAddress: destination,
      }),
    );
  }

  txs.push(
    new Transaction(transactionCtorFields).add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        source,
        destAta,
        wallet.publicKey,
        [],
        amount,
      ),
    ),
  );

  const txId = await sendTransaction({ connection, wallet, txs });

  return { txId };
};

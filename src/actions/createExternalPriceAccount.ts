import { Connection } from '../Connection';
import { Wallet } from '../wallet';

import {
  ExternalPriceAccountData,
  Vault,
  VaultProgram,
  UpdateExternalPriceAccount,
} from '../programs/vault';
import { Keypair, PublicKey, SystemProgram, TransactionCtorFields } from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';
import { Transaction } from '../programs';
import { sendTransaction } from '../actions/transactions';
import { TransactionsBatch } from '../utils/transactions-batch';
import BN from 'bn.js';

interface CreateExternalPriceAccountParams {
  connection: Connection;
  wallet: Wallet;
}

interface CreateExternalPriceAccountResponse {
  txId;
  externalPriceAccount: PublicKey;
  priceMint: PublicKey;
}

// This command creates the external pricing oracle
export const createExternalPriceAccount = async ({
  connection,
  wallet,
}: CreateExternalPriceAccountParams): Promise<CreateExternalPriceAccountResponse> => {
  const txBatch = new TransactionsBatch({ transactions: [] });
  const txOptions: TransactionCtorFields = { feePayer: wallet.publicKey };

  const epaRentExempt = await connection.getMinimumBalanceForRentExemption(
    Vault.MAX_EXTERNAL_ACCOUNT_SIZE,
  );

  const externalPriceAccount = Keypair.generate();

  const externalPriceAccountData = new ExternalPriceAccountData({
    pricePerShare: new BN(0),
    priceMint: NATIVE_MINT.toBase58(),
    allowedToCombine: true,
  });

  const uninitializedEPA = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: externalPriceAccount.publicKey,
      lamports: epaRentExempt,
      space: Vault.MAX_EXTERNAL_ACCOUNT_SIZE,
      programId: VaultProgram.PUBKEY,
    }),
  );
  txBatch.addTransaction(uninitializedEPA);
  txBatch.addSigner(externalPriceAccount);

  const updateEPA = new UpdateExternalPriceAccount(txOptions, {
    externalPriceAccount: externalPriceAccount.publicKey,
    externalPriceAccountData,
  });
  txBatch.addTransaction(updateEPA);

  const txId = await sendTransaction({
    connection,
    signers: txBatch.signers,
    txs: txBatch.transactions,
    wallet,
  });

  return {
    txId,
    externalPriceAccount: externalPriceAccount.publicKey,
    priceMint: NATIVE_MINT,
  };
};

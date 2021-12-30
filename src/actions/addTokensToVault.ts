import BN from 'bn.js';
import { AccountLayout } from '@solana/spl-token';
import {
  Vault,
  SafetyDepositBox,
  AddTokenToInactiveVault,
} from '@metaplex-foundation/mpl-token-vault';
import { Connection, TransactionSignature, PublicKey, Keypair } from '@solana/web3.js';

import { Wallet } from '../wallet';
import { createApproveTxs } from './shared';
import { sendTransaction } from './transactions';
import { CreateTokenAccount } from '../programs';
import { TransactionsBatch } from '../utils/transactions-batch';

interface Token2Add {
  tokenAccount: PublicKey;
  tokenMint: PublicKey;
  amount: BN;
}

interface AddTokensToVaultParams {
  connection: Connection;
  wallet: Wallet;
  vaultPub: PublicKey;
  nfts: Token2Add[];
}

interface SafetyDepositTokenStore {
  txId: TransactionSignature;
  tokenStoreAccount: PublicKey;
  tokenMint: PublicKey;
}

export const addTokensToVault = async ({
  connection,
  wallet,
  vaultPub,
  nfts,
}: AddTokensToVaultParams): Promise<{ safetyDepositTokenStores: SafetyDepositTokenStore[] }> => {
  const txOptions = { feePayer: wallet.publicKey };
  const safetyDepositTokenStores: SafetyDepositTokenStore[] = [];

  const vaultAuthority = await Vault.getPDA(vaultPub);
  const accountRent = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  for (const nft of nfts) {
    const tokenTxBatch = new TransactionsBatch({ transactions: [] });
    const safetyDepositBox = await SafetyDepositBox.getPDA(vaultPub, nft.tokenMint);

    const tokenStoreAccount = Keypair.generate();
    const tokenStoreAccountTx = new CreateTokenAccount(txOptions, {
      newAccountPubkey: tokenStoreAccount.publicKey,
      lamports: accountRent,
      mint: nft.tokenMint,
      owner: vaultAuthority,
    });
    tokenTxBatch.addTransaction(tokenStoreAccountTx);
    tokenTxBatch.addSigner(tokenStoreAccount);

    const { authority: transferAuthority, createApproveTx } = createApproveTxs({
      account: nft.tokenAccount,
      owner: wallet.publicKey,
      amount: nft.amount.toNumber(),
    });
    tokenTxBatch.addTransaction(createApproveTx);
    tokenTxBatch.addSigner(transferAuthority);

    const addTokenTx = new AddTokenToInactiveVault(txOptions, {
      vault: vaultPub,
      vaultAuthority: wallet.publicKey,
      tokenAccount: nft.tokenAccount,
      tokenStoreAccount: tokenStoreAccount.publicKey,
      transferAuthority: transferAuthority.publicKey,
      safetyDepositBox: safetyDepositBox,
      amount: nft.amount,
    });
    tokenTxBatch.addTransaction(addTokenTx);

    const txId = await sendTransaction({
      connection,
      wallet,
      txs: tokenTxBatch.transactions,
      signers: tokenTxBatch.signers,
    });

    safetyDepositTokenStores.push({
      txId,
      tokenStoreAccount: tokenStoreAccount.publicKey,
      tokenMint: nft.tokenMint,
    });
  }

  return { safetyDepositTokenStores };
};

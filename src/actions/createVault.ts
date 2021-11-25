import { Connection } from '../Connection';
import { Wallet } from '../wallet';

import { InitVault, Vault, VaultProgram } from 'src/programs/vault';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { AccountLayout, MintLayout, NATIVE_MINT } from '@solana/spl-token';
import { CreateMint, CreateTokenAccount, Transaction } from '../programs';
import { sendTransaction } from '.';
import { TransactionsBatch } from 'src/utils/transactions-batch';

interface CreateVaultParams {
  connection: Connection;
  wallet: Wallet;
  priceMint: PublicKey;
  externalPriceAccount: PublicKey;
}

interface CreateVaultResponse {
  txId;
  vault: PublicKey;
  fractionalMint: PublicKey;
  redeemTreasury: PublicKey;
  fractionTreasury: PublicKey;
}

// This command creates the external pricing oracle a vault
// This gets the vault ready for adding the tokens.
export const createVault = async ({
  connection,
  wallet,
  priceMint = NATIVE_MINT,
  externalPriceAccount,
}: CreateVaultParams): Promise<CreateVaultResponse> => {
  const accountRent = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);

  const vaultRent = await connection.getMinimumBalanceForRentExemption(Vault.MAX_VAULT_SIZE);

  const vault = Keypair.generate();

  const vaultAuthority = await Vault.getPDA(new PublicKey(VaultProgram.PUBKEY));

  const txBatch = new TransactionsBatch({ transactions: [] });

  const fractionalMint = Keypair.generate();
  const fractionalMintTx = new CreateMint(
    { feePayer: wallet.publicKey },
    {
      newAccountPubkey: fractionalMint.publicKey,
      lamports: mintRent,
    },
  );
  txBatch.addTransaction(fractionalMintTx);
  txBatch.addSigner(fractionalMint);

  const redeemTreasury = Keypair.generate();
  const redeemTreasuryTx = new CreateTokenAccount(
    { feePayer: wallet.publicKey },
    {
      newAccountPubkey: redeemTreasury.publicKey,
      lamports: accountRent,
      mint: priceMint,
    },
  );
  txBatch.addTransaction(redeemTreasuryTx);
  txBatch.addSigner(redeemTreasury);

  const fractionTreasury = Keypair.generate();
  const fractionTreasuryTx = new CreateTokenAccount(
    { feePayer: wallet.publicKey },
    {
      newAccountPubkey: fractionTreasury.publicKey,
      lamports: accountRent,
      mint: priceMint,
    },
  );
  txBatch.addTransaction(fractionTreasuryTx);
  txBatch.addSigner(fractionTreasury);

  const uninitializedVaultTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: vault.publicKey,
      lamports: vaultRent,
      space: Vault.MAX_VAULT_SIZE,
      programId: VaultProgram.PUBKEY,
    }),
  );
  txBatch.addTransaction(uninitializedVaultTx);

  const initVaultTx = new InitVault(
    { feePayer: wallet.publicKey },
    {
      vault: vault.publicKey,
      vaultAuthority: vaultAuthority,
      fractionalTreasury: fractionTreasury.publicKey,
      pricingLookupAddress: externalPriceAccount,
      redeemTreasury: redeemTreasury.publicKey,
      fractionalMint: fractionalMint.publicKey,
      allowFurtherShareCreation: true,
    },
  );
  txBatch.addTransaction(initVaultTx);

  const txId = await sendTransaction({
    connection,
    signers: txBatch.signers,
    txs: txBatch.transactions,
    wallet,
  });

  return {
    txId,
    vault: vault.publicKey,
    fractionalMint: fractionalMint.publicKey,
    redeemTreasury: redeemTreasury.publicKey,
    fractionTreasury: fractionTreasury.publicKey,
  };
};

import { Connection } from '../Connection';
import { Wallet } from '../wallet';

import { ActivateVault, CombineVault, Vault, VaultProgram } from 'src/programs/vault';
import { Keypair, PublicKey } from '@solana/web3.js';
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CreateTokenAccount, Transaction } from '../programs';
import { sendTransaction } from '.';
import BN from 'bn.js';
import { TransactionsBatch } from 'src/utils/transactions-batch';

interface CloseVaultParams {
  connection: Connection;
  wallet: Wallet;
  vault: PublicKey;
  fractionMint: PublicKey;
  fractionTreasury: PublicKey;
  redeemTreasury: PublicKey;
  priceMint: PublicKey;
  externalPriceAccount: PublicKey;
}

interface CloseVaultResponse {
  txId;
}

// This command "closes" the vault, by activating & combining it in one go, handing it over to the auction manager
// authority (that may or may not exist yet.)
export const closeVault = async ({
  connection,
  wallet,
  vault,
  fractionMint,
  fractionTreasury,
  redeemTreasury,
  priceMint,
  externalPriceAccount,
}: CloseVaultParams): Promise<CloseVaultResponse> => {
  const accountRent = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  const fractionMintAuthority = await Vault.getPDA(new PublicKey(VaultProgram.PUBKEY));

  const txBatch = new TransactionsBatch({ transactions: [] });

  const activateVaultTx = new ActivateVault(
    { feePayer: wallet.publicKey },
    {
      vault,
      numberOfShares: new BN(0),
      fractionMint,
      fractionTreasury,
      fractionMintAuthority,
      vaultAuthority: wallet.publicKey,
    },
  );
  txBatch.addTransaction(activateVaultTx);

  const outstandingShareAccount = Keypair.generate();
  const outstandingShareAccountTx = new CreateTokenAccount(
    { feePayer: wallet.publicKey },
    {
      newAccountPubkey: outstandingShareAccount.publicKey,
      lamports: accountRent,
      mint: fractionMint,
    },
  );
  txBatch.addTransaction(outstandingShareAccountTx);
  txBatch.addSigner(outstandingShareAccount);

  const payingTokenAccount = Keypair.generate();
  const payingTokenAccountTx = new CreateTokenAccount(
    { feePayer: wallet.publicKey },
    {
      newAccountPubkey: payingTokenAccount.publicKey,
      lamports: accountRent,
      mint: priceMint,
    },
  );
  txBatch.addTransaction(payingTokenAccountTx);
  txBatch.addSigner(payingTokenAccount);

  const transferAuthority = Keypair.generate();

  const createApproveTx = (account) =>
    new Transaction().add(
      Token.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        account.publicKey,
        transferAuthority.publicKey,
        wallet.publicKey,
        [],
        0,
      ),
    );

  txBatch.addTransaction(createApproveTx(payingTokenAccount));
  txBatch.addTransaction(createApproveTx(outstandingShareAccount));
  txBatch.addSigner(transferAuthority);

  const combineVaultTx = new CombineVault(
    { feePayer: wallet.publicKey },
    {
      vault,
      outstandingShareTokenAccount: outstandingShareAccount.publicKey,
      payingTokenAccount: payingTokenAccount.publicKey,
      fractionMint,
      fractionTreasury,
      redeemTreasury,
      burnAuthority: fractionMintAuthority,
      externalPriceAccount,
      transferAuthority: transferAuthority.publicKey,
      vaultAuthority: wallet.publicKey,
      newVaultAuthority: wallet.publicKey,
    },
  );
  txBatch.addTransaction(combineVaultTx);

  const txId = await sendTransaction({
    connection,
    signers: txBatch.signers,
    txs: txBatch.transactions,
    wallet,
  });

  return {
    txId,
  };
};

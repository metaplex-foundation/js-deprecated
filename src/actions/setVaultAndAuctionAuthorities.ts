import { Connection } from '../Connection';
import { Wallet } from '../wallet';

import { SetVaultAuthority } from '../programs/vault';
import { PublicKey } from '@solana/web3.js';
import { sendTransaction } from '.';
import { TransactionsBatch } from '../utils/transactions-batch';
import { SetAuctionAuthority } from '../programs/auction';

interface SetVaultAndAuctionAuthoritiesParams {
  connection: Connection;
  wallet: Wallet;
  vault: PublicKey,
  auction: PublicKey,
  auctionManager: PublicKey,
}

interface SetVaultAndAuctionAuthoritiesResponse {
  txId;
}

// This command "closes" the vault, by activating & combining it in one go, handing it over to the auction manager
// authority (that may or may not exist yet.)
export const setVaultAndAuctionAuthorities = async ({
  connection,
  wallet,
  vault,
  auction,
  auctionManager,
}: SetVaultAndAuctionAuthoritiesParams): Promise<SetVaultAndAuctionAuthoritiesResponse> => {


  const txBatch = new TransactionsBatch({ transactions: [] });

  const setAuctionAuthorityTx = new SetAuctionAuthority(
    { feePayer: wallet.publicKey },
    {
      auction,
      currentAuthority: wallet.publicKey,
      newAuthority: auctionManager,
    },
  );
  txBatch.addTransaction(setAuctionAuthorityTx);

  const setVaultAuthorityTx = new SetVaultAuthority(
    { feePayer: wallet.publicKey },
    {
      vault,
      currentAuthority: wallet.publicKey,
      newAuthority: auctionManager,
    },
  );
  txBatch.addTransaction(setVaultAuthorityTx);

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

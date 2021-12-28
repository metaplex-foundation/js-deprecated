import { Connection } from '../Connection';
import { Wallet } from '../wallet';

import { StringPublicKey, Transaction } from '@metaplex-foundation/mpl-core';
import { PublicKey, TransactionSignature } from '@solana/web3.js';
import { sendTransaction } from '../actions/transactions';
import { TransactionsBatch } from '../utils/transactions-batch';
import {
  Auction,
  AuctionExtended,
  CreateAuction,
  CreateAuctionArgs,
  PriceFloor,
  WinnerLimit,
} from '@metaplex-foundation/mpl-auction';
import BN from 'bn.js';

interface MakeAuctionParams {
  connection: Connection;
  wallet: Wallet;
  vault: PublicKey;
  auctionSettings: CreateAuctionArgs;
}

interface MakeAuctionResponse {
  txId: TransactionSignature;
  auction: PublicKey;
}

// This command makes an auction
export const makeAuction = async ({
  connection,
  wallet,
  vault,
  auctionSettings,
}: MakeAuctionParams): Promise<MakeAuctionResponse> => {
  const txOptions = { feePayer: wallet.publicKey };
  const auctionKey = await Auction.getPDA(vault);

  const txBatch = new TransactionsBatch({ transactions: [] });

  const fullSettings = new CreateAuctionArgs({
    ...auctionSettings,
    authority: wallet.publicKey.toBase58(),
    resource: vault.toBase58(),
  });

  console.log(CreateAuction);

  const auctionTx: Transaction = new CreateAuction(txOptions, {
    args: fullSettings,
    auction: auctionKey,
    creator: wallet.publicKey,
    auctionExtended: await AuctionExtended.getPDA(vault),
  });

  txBatch.addTransaction(auctionTx);

  const txId = await sendTransaction({
    connection,
    signers: txBatch.signers,
    txs: txBatch.transactions,
    wallet,
  });

  return {
    txId,
    auction: auctionKey,
  };
};

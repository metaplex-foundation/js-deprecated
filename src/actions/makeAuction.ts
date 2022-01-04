import { Transaction } from '@metaplex-foundation/mpl-core';
import {
  Auction,
  AuctionExtended,
  CreateAuction,
  CreateAuctionArgs,
} from '@metaplex-foundation/mpl-auction';
import { PublicKey, TransactionSignature } from '@solana/web3.js';

import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { createVault } from './createVault';
import { sendTransaction } from './transactions';
import { createExternalPriceAccount } from './createExternalPriceAccount';

interface MakeAuctionParams {
  connection: Connection;
  wallet: Wallet;
  auctionSettings: Omit<CreateAuctionArgs, 'resource' | 'authority'>;
}

interface MakeAuctionResponse {
  txId: TransactionSignature;
  auction: PublicKey;
  vault: PublicKey;
}

export const makeAuction = async ({
  connection,
  wallet,
  auctionSettings,
}: MakeAuctionParams): Promise<MakeAuctionResponse> => {
  const txOptions = { feePayer: wallet.publicKey };

  const externalPriceAccountData = await createExternalPriceAccount({ connection, wallet });

  const { vault } = await createVault({
    connection,
    wallet,
    ...externalPriceAccountData,
  });

  const [auctionKey, auctionExtended] = await Promise.all([
    Auction.getPDA(vault),
    AuctionExtended.getPDA(vault),
  ]);

  const fullSettings = new CreateAuctionArgs({
    ...auctionSettings,
    authority: wallet.publicKey.toBase58(),
    resource: vault.toBase58(),
  });

  const auctionTx: Transaction = new CreateAuction(txOptions, {
    args: fullSettings,
    auction: auctionKey,
    creator: wallet.publicKey,
    auctionExtended,
  });

  const txId = await sendTransaction({
    connection,
    signers: [],
    txs: [auctionTx],
    wallet,
  });

  return { txId, auction: auctionKey, vault };
};

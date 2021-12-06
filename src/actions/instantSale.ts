import { PublicKey } from '@solana/web3.js';
import retry from 'async-retry';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { AuctionExtended } from '../programs/auction';
import { AuctionManager, SafetyDepositConfig, WinningConfigType } from '../programs/metaplex';
import { placeBid } from './placeBid';
import { claimBid } from './claimBid';
import { Vault } from '../programs/vault/accounts/Vault';
import { redeemFullRightsTransferBid } from './redeemFullRightsTransferBid';
import { Account } from '../Account';
import { redeemPrintingV2Bid } from './redeemPrintingV2Bid';

interface IInstantSaleParams {
  connection: Connection;
  wallet: Wallet;
  auction: PublicKey;
  store: PublicKey;
}

interface IInstantSaleResponse {
  txIds: string[];
}

export const instantSale = async ({
  connection,
  wallet,
  store,
  auction,
}: IInstantSaleParams): Promise<IInstantSaleResponse> => {
  const txIds = [];
  // get data for transactions
  const auctionManagerPDA = await AuctionManager.getPDA(auction);
  const manager = await AuctionManager.load(connection, auctionManagerPDA);
  const vault = await Vault.load(connection, manager.data.vault);
  const auctionExtendedPDA = await AuctionExtended.getPDA(vault.pubkey);
  const {
    data: { instantSalePrice },
  } = await AuctionExtended.load(connection, auctionExtendedPDA);
  const [safetyDepositBox] = await vault.getSafetyDepositBoxes(connection);
  const safetyDepositConfigPDA = await SafetyDepositConfig.getPDA(
    auctionManagerPDA,
    safetyDepositBox.pubkey,
  );
  const {
    data: { winningConfigType },
  } = await SafetyDepositConfig.load(connection, safetyDepositConfigPDA);
  ////

  const {
    txId: placeBidTxId,
    bidderPotToken,
    bidderMeta,
  } = await placeBid({
    connection,
    wallet,
    amount: instantSalePrice,
    auction,
  });
  txIds.push(placeBidTxId);

  // workaround to wait for bidderMeta to be created
  await retry(async (bail) => {
    await Account.getInfo(connection, bidderMeta);
  });

  // NOTE: it's divided into 3 transactions since transaction size is restricted
  switch (winningConfigType) {
    case WinningConfigType.FullRightsTransfer:
      const { txId: redeemFullRightsTransferBidTxId } = await redeemFullRightsTransferBid({
        connection,
        wallet,
        store,
        auction,
      });
      txIds.push(redeemFullRightsTransferBidTxId);
      break;
    case WinningConfigType.PrintingV2:
      const { txId: redeemPrintingV2BidTxId } = await redeemPrintingV2Bid({
        connection,
        wallet,
        store,
        auction,
      });
      txIds.push(redeemPrintingV2BidTxId);
      break;
    default:
      throw new Error(`${winningConfigType} winning type isn't supported yet`);
  }

  const { txId: claimBidTxId } = await claimBid({
    connection,
    wallet,
    store,
    auction,
    bidderPotToken,
  });
  txIds.push(claimBidTxId);

  return { txIds: [placeBidTxId] };
};

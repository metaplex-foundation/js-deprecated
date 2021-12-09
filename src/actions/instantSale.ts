import { PublicKey } from '@solana/web3.js';
import retry from 'async-retry';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { Auction, AuctionExtended } from '@metaplex-foundation/mpl-auction';
import {
  AuctionManager,
  SafetyDepositConfig,
  WinningConfigType,
} from '@metaplex-foundation/mpl-metaplex';
import { placeBid } from './placeBid';
import { claimBid } from './claimBid';
import { Vault } from '@metaplex-foundation/mpl-token-vault';
import { redeemFullRightsTransferBid } from './redeemFullRightsTransferBid';
import { redeemPrintingV2Bid } from './redeemPrintingV2Bid';
import {
  isEligibleForParticipationPrize,
  redeemParticipationBidV3,
} from './redeemParticipationBidV3';
import { cancelBid } from './cancelBid';

interface IInstantSaleParams {
  connection: Connection;
  wallet: Wallet;
  auction: PublicKey;
  store: PublicKey;
}

interface IInstantSaleResponse {
  txId: string[];
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
    data: { winningConfigType, participationConfig },
  } = await SafetyDepositConfig.load(connection, safetyDepositConfigPDA);
  ////

  const { txId: placeBidTxId, bidderPotToken } = await placeBid({
    connection,
    wallet,
    amount: instantSalePrice,
    auction,
    // wait for all accounts to be created
    commitment: 'finalized',
  });
  txIds.push(placeBidTxId);

  const {
    data: { bidState },
  } = await Auction.load(connection, auction);
  const winIndex = bidState.getWinnerIndex(wallet.publicKey.toBase58());
  const hasWinner = winIndex !== null;

  // NOTE: it's divided into several transactions since transaction size is restricted
  if (hasWinner) {
    if (winningConfigType === WinningConfigType.FullRightsTransfer) {
      const { txId } = await redeemFullRightsTransferBid({ connection, wallet, store, auction });
      txIds.push(txId);
    } else if (winningConfigType === WinningConfigType.PrintingV2) {
      const { txId } = await redeemPrintingV2Bid({ connection, wallet, store, auction });
      txIds.push(txId);
    } else {
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
  } else {
    // if user didn't win, user must have a bid we can refund before we check for open editions
    const { txId } = await cancelBid({ connection, wallet, auction, bidderPotToken });
    txIds.push(txId);
  }

  const hasWonParticipationPrize = isEligibleForParticipationPrize(winIndex, participationConfig);
  if (hasWonParticipationPrize) {
    const { txId } = await redeemParticipationBidV3({ connection, wallet, store, auction });
    txIds.push(...txId);
  }

  return { txId: txIds };
};

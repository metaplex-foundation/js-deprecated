import { PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { Auction, AuctionExtended, BidderPot } from '@metaplex-foundation/mpl-auction';
import { TransactionsBatch } from '../utils/transactions-batch';
import { AuctionManager, ClaimBid } from '@metaplex-foundation/mpl-metaplex';

/**
 * Parameters for {@link claimBid}
 */
export interface ClaimBidParams {
  connection: Connection;
  /** Wallet of the bidder the bid that is being cancelled belongs to **/
  wallet: Wallet;
  /** The address of the auction program account for the bid that is being cancelled **/
  auction: PublicKey;
  /** The address of the store the auction manager the bid is being cancelled on belongs to **/
  store: PublicKey;
  /** Bidder pot SPL associated token account **/
  bidderPotToken: PublicKey;
}

export interface ClaimBidResponse {
  txId: string;
}

/**
 * Claim a winning bid as the auctioneer. Pulling money out of the auction contract as an auctioneer can only be done after an auction has ended and must be done for each winning bid, one after the other.
 */
export const claimBid = async ({
  connection,
  wallet,
  store,
  auction,
  bidderPotToken,
}: ClaimBidParams): Promise<ClaimBidResponse> => {
  // get data for transactions
  const bidder = wallet.publicKey;
  const auctionManager = await AuctionManager.getPDA(auction);
  const manager = await AuctionManager.load(connection, auctionManager);
  const vault = new PublicKey(manager.data.vault);
  const {
    data: { tokenMint },
  } = await Auction.load(connection, auction);
  const acceptPayment = new PublicKey(manager.data.acceptPayment);
  const auctionExtended = await AuctionExtended.getPDA(vault);
  const auctionTokenMint = new PublicKey(tokenMint);
  const bidderPot = await BidderPot.getPDA(auction, bidder);
  ////

  const txBatch = await getClaimBidTransactions({
    auctionTokenMint,
    bidder,
    store,
    vault,
    auction,
    auctionExtended,
    auctionManager,
    acceptPayment,
    bidderPot,
    bidderPotToken,
  });

  const txId = await sendTransaction({
    connection,
    wallet,
    txs: txBatch.toTransactions(),
    signers: txBatch.signers,
  });

  return { txId };
};

interface IClaimBidTransactionsParams {
  bidder: PublicKey;
  bidderPotToken?: PublicKey;
  bidderPot: PublicKey;
  auction: PublicKey;
  auctionExtended: PublicKey;
  auctionTokenMint: PublicKey;
  vault: PublicKey;
  store: PublicKey;
  auctionManager: PublicKey;
  acceptPayment: PublicKey;
}

export const getClaimBidTransactions = async ({
  bidder,
  auctionTokenMint,
  store,
  vault,
  auction,
  auctionManager,
  auctionExtended,
  acceptPayment,
  bidderPot,
  bidderPotToken,
}: IClaimBidTransactionsParams) => {
  const txBatch = new TransactionsBatch({ transactions: [] });

  // create claim bid
  const claimBidTransaction = new ClaimBid(
    { feePayer: bidder },
    {
      store,
      vault,
      auction,
      auctionExtended,
      auctionManager,
      bidder,
      tokenMint: auctionTokenMint,
      acceptPayment,
      bidderPot,
      bidderPotToken,
    },
  );
  txBatch.addTransaction(claimBidTransaction);
  ////

  return txBatch;
};

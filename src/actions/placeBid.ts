import BN from 'bn.js';
import { Commitment, Keypair, PublicKey, TransactionSignature } from '@solana/web3.js';
import { AccountLayout } from '@solana/spl-token';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import {
  AuctionExtended,
  BidderMetadata,
  BidderPot,
  PlaceBid,
} from '@metaplex-foundation/mpl-auction';
import { AuctionManager } from '@metaplex-foundation/mpl-metaplex';
import { TransactionsBatch } from '../utils/transactions-batch';
import { getCancelBidTransactions } from './cancelBid';
import { CreateTokenAccount } from '../transactions';
import { createApproveTxs, createWrappedAccountTxs } from './shared';

/**
 * Parameters for {@link placeBid}
 */
export interface PlaceBidParams {
  connection: Connection;
  /** The wallet from which tokens will be taken and transferred to the {@link bidderPotToken} account **/
  wallet: Wallet;
  /** The {@link Auction} program account address for the bid **/
  auction: PublicKey;
  /** Associated token account for the bidder pot **/
  bidderPotToken?: PublicKey;
  /** Amount of tokens (accounting for decimals) or lamports to bid. One important nuance to remember is that each token mint has a different amount of decimals, which need to be accounted while specifying the amount. For instance, to send 1 token with a 0 decimal mint you would provide `1` as the amount, but for a token mint with 6 decimals you would provide `1000000` as the amount to transfer one whole token **/
  amount: BN;
  commitment?: Commitment;
}

export interface PlaceBidResponse {
  txId: TransactionSignature;
  bidderPotToken: PublicKey;
  bidderMeta: PublicKey;
}

/**
 * Place a bid by taking it from the provided wallet and placing it in the bidder pot account.
 */
export const placeBid = async ({
  connection,
  wallet,
  amount,
  auction,
  bidderPotToken,
}: PlaceBidParams): Promise<PlaceBidResponse> => {
  // get data for transactions
  const bidder = wallet.publicKey;
  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
  const auctionManager = await AuctionManager.getPDA(auction);
  const manager = await AuctionManager.load(connection, auctionManager);
  const {
    data: { tokenMint },
  } = await manager.getAuction(connection);
  const auctionTokenMint = new PublicKey(tokenMint);
  const vault = new PublicKey(manager.data.vault);
  const auctionExtended = await AuctionExtended.getPDA(vault);
  const bidderPot = await BidderPot.getPDA(auction, bidder);
  const bidderMeta = await BidderMetadata.getPDA(auction, bidder);
  ////

  let txBatch = new TransactionsBatch({ transactions: [] });

  if (bidderPotToken) {
    // cancel prev bid
    txBatch = await getCancelBidTransactions({
      destAccount: null,
      bidder,
      accountRentExempt,
      bidderPot,
      bidderPotToken,
      bidderMeta,
      auction,
      auctionExtended,
      auctionTokenMint,
      vault,
    });
    ////
  } else {
    // create a new account for bid
    const account = Keypair.generate();
    const createBidderPotTransaction = new CreateTokenAccount(
      { feePayer: bidder },
      {
        newAccountPubkey: account.publicKey,
        lamports: accountRentExempt,
        mint: auctionTokenMint,
        owner: auction,
      },
    );
    txBatch.addSigner(account);
    txBatch.addTransaction(createBidderPotTransaction);
    bidderPotToken = account.publicKey;
    ////
  }

  // create paying account
  const {
    account: payingAccount,
    createTokenAccountTx,
    closeTokenAccountTx,
  } = await createWrappedAccountTxs(connection, bidder, amount.toNumber() + accountRentExempt * 2);
  txBatch.addTransaction(createTokenAccountTx);
  txBatch.addAfterTransaction(closeTokenAccountTx);
  txBatch.addSigner(payingAccount);
  ////

  // transfer authority
  const {
    authority: transferAuthority,
    createApproveTx,
    createRevokeTx,
  } = createApproveTxs({
    account: payingAccount.publicKey,
    owner: bidder,
    amount: amount.toNumber(),
  });
  txBatch.addTransaction(createApproveTx);
  txBatch.addAfterTransaction(createRevokeTx);
  txBatch.addSigner(transferAuthority);
  ////

  // create place bid transaction
  const placeBidTransaction = new PlaceBid(
    { feePayer: bidder },
    {
      bidder,
      bidderToken: payingAccount.publicKey,
      bidderPot,
      bidderPotToken,
      bidderMeta,
      auction,
      auctionExtended,
      tokenMint: auctionTokenMint,
      transferAuthority: transferAuthority.publicKey,
      amount,
      resource: vault,
    },
  );
  txBatch.addTransaction(placeBidTransaction);
  ////

  const txId = await sendTransaction({
    connection,
    wallet,
    txs: txBatch.toTransactions(),
    signers: txBatch.signers,
  });

  return { txId, bidderPotToken, bidderMeta };
};

import BN from 'bn.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import { AccountLayout, NATIVE_MINT, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { AuctionExtended, BidderMetadata, BidderPot, PlaceBid } from '../programs/auction';
import { TransactionsBatch } from '../utils/transactions-batch';
import { getCancelBidTransactions } from './cancelBid';
import { AuctionManager } from '../programs/metaplex';
import { CreateTokenAccount, Transaction } from '../programs';

interface IPlaceBidParams {
  connection: Connection;
  wallet: Wallet;
  auction: PublicKey;
  bidderPotToken?: PublicKey;
  // amount in lamports
  amount: BN;
}

interface IPlaceBidResponse {
  txId: string;
  bidderPotToken: PublicKey;
  bidderMeta: PublicKey;
}

export const placeBid = async ({
  connection,
  wallet,
  amount,
  auction,
  bidderPotToken,
}: IPlaceBidParams): Promise<IPlaceBidResponse> => {
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
  const payingAccount = Keypair.generate();
  const createTokenAccountTransaction = new CreateTokenAccount(
    { feePayer: bidder },
    {
      newAccountPubkey: payingAccount.publicKey,
      // TODO: find out why we put such amount of lamports
      lamports: amount.toNumber() + accountRentExempt * 3,
      mint: NATIVE_MINT,
    },
  );
  const closeTokenAccountTransaction = new Transaction().add(
    Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      payingAccount.publicKey,
      bidder,
      bidder,
      [],
    ),
  );
  txBatch.addTransaction(createTokenAccountTransaction);
  txBatch.addAfterTransaction(closeTokenAccountTransaction);
  txBatch.addSigner(payingAccount);
  ////

  // transfer authority
  const transferAuthority = Keypair.generate();
  const createApproveTransaction = new Transaction().add(
    Token.createApproveInstruction(
      TOKEN_PROGRAM_ID,
      payingAccount.publicKey,
      transferAuthority.publicKey,
      bidder,
      [],
      amount.toNumber(),
    ),
  );
  txBatch.addTransaction(createApproveTransaction);

  const createRevokeTransaction = new Transaction().add(
    Token.createRevokeInstruction(TOKEN_PROGRAM_ID, payingAccount.publicKey, bidder, []),
  );
  txBatch.addAfterTransaction(createRevokeTransaction);
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

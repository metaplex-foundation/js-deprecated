import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { AccountLayout, NATIVE_MINT, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AuctionExtended, BidderMetadata, BidderPot, CancelBid } from '../programs/auction';
import { TransactionsBatch } from '../utils/transactions-batch';
import { AuctionManager } from '../programs/metaplex';
import { CreateTokenAccount } from '../programs';

interface ICancelBidParams {
  connection: Connection;
  wallet: Wallet;
  auctionManager: PublicKey;
  bidderPotToken: PublicKey;
  destAccount?: PublicKey;
}

interface ICancelBidResponse {
  txId: string;
}

export const cancelBid = async ({
  connection,
  wallet,
  auctionManager,
  bidderPotToken,
  destAccount,
}: ICancelBidParams): Promise<ICancelBidResponse> => {
  const bidder = wallet.publicKey;
  const txBatch = new TransactionsBatch({ transactions: [] });

  const manager = await AuctionManager.load(connection, auctionManager);
  const auction = await manager.getAuction(connection);

  const auctionStrKey = manager.data.auction;
  const auctionTokenMintStrKey = auction.data.tokenMint;
  const vaultStrKey = manager.data.vault;
  const auctionExtendedKey = await AuctionExtended.getPDA(vaultStrKey);
  const bidderPotKey = await BidderPot.getPDA(auctionStrKey, bidder);
  const bidderMetaKey = await BidderMetadata.getPDA(auctionStrKey, bidder);

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  if (!destAccount) {
    const account = Keypair.generate();
    const createTokenAccountTransaction = new CreateTokenAccount(
      { feePayer: bidder },
      {
        newAccountPubkey: account.publicKey,
        lamports: accountRentExempt,
        mint: NATIVE_MINT,
      },
    );
    const closeTokenAccountInstruction = new Transaction().add(
      Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, account.publicKey, bidder, bidder, []),
    );
    txBatch.addTransaction(createTokenAccountTransaction);
    txBatch.addAfterTransaction(closeTokenAccountInstruction);
    txBatch.addSigner(account);
    destAccount = account.publicKey;
  }

  const cancelBidTransaction = new CancelBid(
    { feePayer: bidder },
    {
      bidder,
      bidderToken: destAccount,
      bidderPot: bidderPotKey,
      bidderPotToken,
      bidderMeta: bidderMetaKey,
      auction: new PublicKey(auctionStrKey),
      auctionExtended: auctionExtendedKey,
      tokenMint: new PublicKey(auctionTokenMintStrKey),
      resource: new PublicKey(vaultStrKey),
    },
  );
  txBatch.addTransaction(cancelBidTransaction);

  const txId = await sendTransaction({
    connection,
    wallet,
    txs: txBatch.toTransactions(),
    signers: txBatch.signers,
  });

  return { txId };
};

export const getCancelTransactions = async ({
  destAccount,
  bidder,
  accountRentExempt,
  bidderPotKey,
  bidderPotToken,
  bidderMetaKey,
  auctionStrKey,
  auctionExtendedKey,
  auctionTokenMintStrKey,
  vaultStrKey,
}): Promise<TransactionsBatch> => {
  const txBatch = new TransactionsBatch({ transactions: [] });
  if (!destAccount) {
    const account = Keypair.generate();
    const createTokenAccountTransaction = new CreateTokenAccount(
      { feePayer: bidder },
      {
        newAccountPubkey: account.publicKey,
        lamports: accountRentExempt,
        mint: NATIVE_MINT,
      },
    );
    const closeTokenAccountInstruction = new Transaction().add(
      Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, account.publicKey, bidder, bidder, []),
    );
    txBatch.addTransaction(createTokenAccountTransaction);
    txBatch.addAfterTransaction(closeTokenAccountInstruction);
    txBatch.addSigner(account);
    destAccount = account.publicKey;
  }

  const cancelBidTransaction = new CancelBid(
    { feePayer: bidder },
    {
      bidder,
      bidderToken: destAccount,
      bidderPot: bidderPotKey,
      bidderPotToken,
      bidderMeta: bidderMetaKey,
      auction: new PublicKey(auctionStrKey),
      auctionExtended: auctionExtendedKey,
      tokenMint: new PublicKey(auctionTokenMintStrKey),
      resource: new PublicKey(vaultStrKey),
    },
  );
  txBatch.addTransaction(cancelBidTransaction);

  return txBatch;
};

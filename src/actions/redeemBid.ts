import { Keypair, PublicKey } from '@solana/web3.js';
import { AccountLayout } from '@solana/spl-token';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { AuctionExtended, BidderMetadata } from '../programs/auction';
import { TransactionsBatch } from '../utils/transactions-batch';
import {
  AuctionManager,
  MetaplexProgram,
  RedeemFullRightsTransferBid,
  SafetyDepositConfig,
} from '../programs/metaplex';
import { CreateTokenAccount } from '../programs';
import { Vault } from '../programs/vault';
import { Metadata, UpdatePrimarySaleHappenedViaToken } from '../programs/metadata';

interface IRedeemBidParams {
  connection: Connection;
  wallet: Wallet;
  auction: PublicKey;
  store: PublicKey;
}

interface IRedeemBidResponse {
  txId: string;
}

export const redeemBid = async ({
  connection,
  wallet,
  store,
  auction,
}: IRedeemBidParams): Promise<IRedeemBidResponse> => {
  // get data for transactions
  const bidder = wallet.publicKey;
  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
  const auctionManager = await AuctionManager.getPDA(auction);
  const manager = await AuctionManager.load(connection, auctionManager);
  const vault = await Vault.load(connection, manager.data.vault);
  const fractionMint = new PublicKey(vault.data.fractionMint);
  const auctionExtended = await AuctionExtended.getPDA(vault.pubkey);
  // assuming we have 1 item
  const [safetyDepositBox] = await vault.getSafetyDepositBoxes(connection);
  const tokenMint = new PublicKey(safetyDepositBox.data.tokenMint);
  const safetyDepositTokenStore = new PublicKey(safetyDepositBox.data.store);
  const bidderMeta = await BidderMetadata.getPDA(auction, bidder);
  // TODO: probably should be moved to a class
  const bidRedemption = (
    await PublicKey.findProgramAddress(
      [Buffer.from(MetaplexProgram.PREFIX), auction.toBuffer(), bidderMeta.toBuffer()],
      MetaplexProgram.PUBKEY,
    )
  )[0];
  const safetyDepositConfig = await SafetyDepositConfig.getPDA(
    auctionManager,
    safetyDepositBox.pubkey,
  );
  const transferAuthority = await Vault.getPDA(vault.pubkey);
  const metadata = await Metadata.getPDA(tokenMint);
  ////

  const txBatch = await getRedeemBidTransactions({
    accountRentExempt,
    tokenMint,
    bidder,
    bidderMeta,
    store,
    vault: vault.pubkey,
    auction,
    auctionExtended,
    auctionManager,
    fractionMint,
    safetyDepositTokenStore,
    safetyDeposit: safetyDepositBox.pubkey,
    bidRedemption,
    safetyDepositConfig,
    transferAuthority,
    metadata,
  });

  const txId = await sendTransaction({
    connection,
    wallet,
    txs: txBatch.toTransactions(),
    signers: txBatch.signers,
  });

  return { txId };
};

interface IRedeemBidTransactionsParams {
  bidder: PublicKey;
  accountRentExempt: number;
  bidderPotToken?: PublicKey;
  bidderMeta: PublicKey;
  auction: PublicKey;
  auctionExtended: PublicKey;
  tokenMint: PublicKey;
  vault: PublicKey;
  store: PublicKey;
  auctionManager: PublicKey;
  bidRedemption: PublicKey;
  safetyDepositTokenStore: PublicKey;
  safetyDeposit: PublicKey;
  fractionMint: PublicKey;
  safetyDepositConfig: PublicKey;
  transferAuthority: PublicKey;
  metadata: PublicKey;
}

export const getRedeemBidTransactions = async ({
  accountRentExempt,
  bidder,
  tokenMint,
  store,
  vault,
  auction,
  auctionManager,
  auctionExtended,
  bidRedemption,
  bidderMeta: bidMetadata,
  safetyDepositTokenStore,
  safetyDeposit,
  fractionMint,
  safetyDepositConfig,
  transferAuthority,
  metadata,
}: IRedeemBidTransactionsParams) => {
  const txBatch = new TransactionsBatch({ transactions: [] });

  // create a new account for redeeming
  const account = Keypair.generate();
  const createDestinationTransaction = new CreateTokenAccount(
    { feePayer: bidder },
    {
      newAccountPubkey: account.publicKey,
      lamports: accountRentExempt,
      mint: tokenMint,
    },
  );
  txBatch.addSigner(account);
  txBatch.addTransaction(createDestinationTransaction);
  ////

  // create redeem bid
  const redeemBidTransaction = new RedeemFullRightsTransferBid(
    { feePayer: bidder },
    {
      store,
      vault,
      auction,
      auctionManager,
      bidRedemption,
      bidMetadata,
      safetyDepositTokenStore,
      destination: account.publicKey,
      safetyDeposit,
      fractionMint,
      bidder,
      safetyDepositConfig,
      auctionExtended,
      transferAuthority,
      newAuthority: bidder,
      masterMetadata: metadata,
    },
  );
  txBatch.addTransaction(redeemBidTransaction);
  ////

  // update primary sale happened via token
  const updatePrimarySaleHappenedViaTokenTransaction = new UpdatePrimarySaleHappenedViaToken(
    { feePayer: bidder },
    {
      metadata,
      owner: bidder,
      tokenAccount: account.publicKey,
    },
  );
  txBatch.addTransaction(updatePrimarySaleHappenedViaTokenTransaction);
  ////

  return txBatch;
};

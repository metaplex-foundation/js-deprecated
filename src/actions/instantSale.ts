import { PublicKey } from '@solana/web3.js';
import { AccountLayout } from '@solana/spl-token';
import retry from 'async-retry';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { Auction, AuctionExtended, BidderPot } from '../programs/auction';
import { AuctionManager, SafetyDepositConfig } from '../programs/metaplex';
import { placeBid } from './placeBid';
import { getClaimBidTransactions } from './claimBid';
import { getRedeemBidTransactions } from './redeemBid';
import { Vault } from '../programs/vault/accounts/Vault';
import { Metadata } from '../programs/metadata';
import { getBidRedemptionPDA } from './redeemBid';
import { Account } from '../Account';

interface IInstantSaleParams {
  connection: Connection;
  wallet: Wallet;
  auction: PublicKey;
  store: PublicKey;
}

interface IInstantSaleResponse {
  txId: string;
}

export const instantSale = async ({
  connection,
  wallet,
  store,
  auction,
}: IInstantSaleParams): Promise<IInstantSaleResponse> => {
  // get data for transactions
  const bidder = wallet.publicKey;
  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
  const auctionManager = await AuctionManager.getPDA(auction);
  const manager = await AuctionManager.load(connection, auctionManager);
  const vault = await Vault.load(connection, manager.data.vault);
  const {
    data: { tokenMint },
  } = await Auction.load(connection, auction);
  const auctionExtended = await AuctionExtended.getPDA(vault.pubkey);
  const acceptPayment = new PublicKey(manager.data.acceptPayment);
  const {
    data: { instantSalePrice },
  } = await AuctionExtended.load(connection, auctionExtended);
  const auctionTokenMint = new PublicKey(tokenMint);
  const bidderPot = await BidderPot.getPDA(auction, bidder);
  const fractionMint = new PublicKey(vault.data.fractionMint);
  // assuming we have 1 item
  const [safetyDepositBox] = await vault.getSafetyDepositBoxes(connection);
  const metadataTokenMint = new PublicKey(safetyDepositBox.data.tokenMint);
  const safetyDepositTokenStore = new PublicKey(safetyDepositBox.data.store);
  const safetyDepositConfig = await SafetyDepositConfig.getPDA(
    auctionManager,
    safetyDepositBox.pubkey,
  );
  const transferAuthority = await Vault.getPDA(vault.pubkey);
  const metadata = await Metadata.getPDA(metadataTokenMint);
  ////

  const { bidderPotToken, bidderMeta } = await placeBid({
    connection,
    wallet,
    amount: instantSalePrice,
    auction,
  });

  // workaround to wait for bidderMeta to be created
  await retry(async (bail) => {
    await Account.getInfo(connection, bidderMeta);
  });
  const bidRedemption = await getBidRedemptionPDA(auction, bidderMeta);

  const redeemBatch = await getRedeemBidTransactions({
    accountRentExempt,
    tokenMint: metadataTokenMint,
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

  const claimBatch = await getClaimBidTransactions({
    auctionTokenMint,
    bidder,
    store,
    vault: vault.pubkey,
    auction,
    auctionExtended,
    auctionManager,
    acceptPayment,
    bidderPot,
    bidderPotToken,
  });

  const txs = [...redeemBatch.toTransactions(), ...claimBatch.toTransactions()];
  const signers = [...redeemBatch.signers, ...claimBatch.signers];

  const txId = await sendTransaction({
    connection,
    wallet,
    txs,
    signers,
  });

  return { txId };
};

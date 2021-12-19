import {web3, Wallet} from '@project-serum/anchor';
import {Cluster, Keypair} from '@solana/web3.js';
import {AnchorWallet} from "@solana/wallet-adapter-react";
import {getAuctionHouseFeeAcct, getAuctionHouseTreasuryAcct, getTokenAmount, loadAuctionHouseProgram} from "./helpers/helpers";

export async function getCommonAuctionHouseWithDetails(auctionHouse: string, env: string) {
  return await getAuctionHouseWithDetails(auctionHouse, env, new Wallet(Keypair.generate()));
}

export async function getAuctionHouseWithDetails(auctionHouse: string,
                                                 env: string,
                                                 walletWrapper: AnchorWallet | undefined) {
  const auctionHouseKey: web3.PublicKey = new web3.PublicKey(auctionHouse);
  const auctionHouseFeesAccount = await getAuctionHouseFeeAcct(auctionHouseKey);
  const auctionHouseTreasuryAccount = await getAuctionHouseTreasuryAcct(auctionHouseKey);

  const anchorProgram = await loadAuctionHouseProgram(walletWrapper, env as Cluster);
  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(auctionHouseKey);
  // @ts-ignore
  const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT);

  const treasuryAmount = await getTokenAmount(
    anchorProgram,
    //@ts-ignore
    auctionHouseObj.auctionHouseTreasury,
    //@ts-ignore
    auctionHouseObj.treasuryMint,
  );

  const feeAmount = await anchorProgram.provider.connection.getBalance(
    //@ts-ignore
    auctionHouseObj.auctionHouseFeeAccount,
  );

  return {
    auctionHouse: auctionHouse,
    auctionHouseKey: auctionHouseKey,
    auctionHouseFeesAccount: auctionHouseFeesAccount,
    auctionHouseTreasuryAccount: auctionHouseTreasuryAccount,
    auctionHouseObj: auctionHouseObj,
    //@ts-ignore
    sellerFeeBasisPoints: auctionHouseObj.sellerFeeBasisPoints,
    //@ts-ignore
    requiresSignOff: auctionHouseObj.requiresSignOff,
    //@ts-ignore
    canChangeSalePrice: auctionHouseObj.canChangeSalePrice,
    //@ts-ignore
    ahBump: auctionHouseObj.bump,
    //@ts-ignore
    ahFeeBump: auctionHouseObj.feePayerBump,
    //@ts-ignore
    ahTreasuryBump: auctionHouseObj.treasuryBump,
    anchorProgram: anchorProgram,
    balance: {
      feeAmount: feeAmount,
      treasuryAmount: treasuryAmount
    },
    base58Details: {
      auctionHouse: auctionHouseKey.toBase58(),
      // @ts-ignore
      treasuryMint: auctionHouseObj.treasuryMint.toBase58(),
      // @ts-ignore
      authority: auctionHouseObj.authority.toBase58(),
      //@ts-ignore
      creator: auctionHouseObj.creator.toBase58(),
      //@ts-ignore
      feePayerAcct: auctionHouseObj.auctionHouseFeeAccount.toBase58(),
      //@ts-ignore
      treasuryAcct: auctionHouseObj.auctionHouseTreasury.toBase58(),
      //@ts-ignore
      feePayerWithdrawalAcct: auctionHouseObj.feeWithdrawalDestination.toBase58(),
      //@ts-ignore
      treasuryWithdrawalAcct: auctionHouseObj.treasuryWithdrawalDestination.toBase58(),
    }
  }
}

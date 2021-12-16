import { PublicKey, PublicKeyInitData } from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import { Connection, Wallet } from '../';
import { AuctionHouseProgram } from './auction-house/AuctionHouseProgram';
import { AuctionHouseAccount } from './auction-house/AuctionHouseAccount';

interface GetActionHouseInfo {
  connection: Connection;
  wallet: Wallet;
  auctionHouse?: PublicKeyInitData;
  treasuryMint?: PublicKeyInitData;
}

export const getActionHouseInfo = async (params: GetActionHouseInfo) => {
  const { connection, wallet, auctionHouse, treasuryMint } = params;

  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: 'recent',
  });

  const anchorProgram = new AuctionHouseProgram(provider);

  const tMintKey = treasuryMint ? new PublicKey(treasuryMint) : NATIVE_MINT;

  const auctionHouseKey = auctionHouse
    ? new PublicKey(auctionHouse)
    : (await AuctionHouseAccount.getAuctionHouse(wallet.publicKey, tMintKey))[0];

  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(auctionHouseKey);

  let treasuryAmount: number;
  if (auctionHouseObj.treasuryMint.equals(NATIVE_MINT)) {
    treasuryAmount = await anchorProgram.provider.connection.getBalance(
      auctionHouseObj.auctionHouseTreasury,
    );
  } else {
    try {
      const token = await anchorProgram.provider.connection.getTokenAccountBalance(
        auctionHouseObj.auctionHouseTreasury,
      );
      treasuryAmount = token.value.uiAmount * Math.pow(10, token.value.decimals);
    } catch (e) {
      treasuryAmount = 0;
    }
  }

  const feeAmount = await anchorProgram.provider.connection.getBalance(
    auctionHouseObj.auctionHouseFeeAccount,
  );

  return {
    ...auctionHouseObj,
    feeAmount,
    treasuryAmount,
  };
};

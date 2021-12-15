import {AnchorWallet} from "@solana/wallet-adapter-react";
import { BN, web3 } from '@project-serum/anchor';
import {CancelResponse, Txn} from "./helpers/types";
import {getAtaForMint, getAuctionHouseTradeState, getPriceWithMantissa} from "./helpers/helpers";
import {TOKEN_PROGRAM_ID} from "./helpers/constants";
import {sendTransactionWithRetryWithKeypair} from "./helpers/transactions";

export async function cancel(auctionHouseWithDetails: object,
                             walletWrapper: AnchorWallet | undefined,
                             mint: string,
                             buyPrice: number): Promise<CancelResponse> {

  // @ts-ignore
  console.log(JSON.stringify(auctionHouseWithDetails.balance, null , 2))
  console.log(JSON.stringify(walletWrapper?.publicKey.toBase58(), null , 2))
  const tokenSize = 1;
  // @ts-ignore
  const auctionHouseKey = auctionHouseWithDetails.auctionHouseKey;
  const mintKey = new web3.PublicKey(mint);
  // @ts-ignore
  const anchorProgram = auctionHouseWithDetails.anchorProgram;
  // @ts-ignore
  const auctionHouseObj = auctionHouseWithDetails.auctionHouseObj;

  const buyPriceAdjusted = new BN(
    await getPriceWithMantissa(
      buyPrice,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      walletWrapper,
      anchorProgram,
    ),
  );

  const tokenSizeAdjusted = new BN(
    await getPriceWithMantissa(
      tokenSize,
      mintKey,
      walletWrapper,
      anchorProgram,
    ),
  );

  const tokenAccountKey = await getAtaForMint(mintKey, walletWrapper!.publicKey);

  const tradeState = (
    await getAuctionHouseTradeState(
      auctionHouseKey,
      walletWrapper!.publicKey,
      tokenAccountKey,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      mintKey,
      tokenSizeAdjusted,
      buyPriceAdjusted,
    )
  )[0];

  const signers: any[] = [];

  const instruction = await anchorProgram.instruction.cancel(
    buyPriceAdjusted,
    tokenSizeAdjusted,
    {
      accounts: {
        wallet: walletWrapper!.publicKey,
        tokenAccount: tokenAccountKey,
        tokenMint: mintKey,
        //@ts-ignore
        authority: auctionHouseObj.authority,
        auctionHouse: auctionHouseKey,
        //@ts-ignore
        auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
        tradeState,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers,
    },
  );

  console.log("signers ", JSON.stringify(signers, null , 2))
  instruction.keys
  // @ts-ignore
  .filter((k) => k.pubkey.equals(walletWrapper.publicKey))
  // @ts-ignore
  .map((k) => (k.isSigner = true));

  const txData: Txn = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletWrapper,
    [instruction],
    signers,
    'max',
  );

  const cancelResponse: CancelResponse = {
    txn: txData.txid,
    seller_wallet: walletWrapper?.publicKey.toBase58(),
    mint: mint,
    price: buyPrice,
    auction_house: auctionHouseKey.toBase58(),
    error: txData.error
  }
  return cancelResponse;
}

import {AnchorWallet} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import {web3} from "@project-serum/anchor";
import {Connection} from "@solana/web3.js";
import {
  getAtaForMint,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  getMetadata,
  getPriceWithMantissa
} from "./helpers/helpers";
import {SellResponse} from "./helpers/types";
import {createAssociatedTokenAccountInstruction, getTransferInstructions} from "./helpers/instructions";
import {TOKEN_PROGRAM_ID} from "./helpers/constants";
import { sendTransactionWithRetryWithKeypair } from "./helpers/transactions";

export async function sell(auctionHouseWithDetails: object,
                           walletWrapper: AnchorWallet | undefined,
                           mint: string,
                           buyPrice: number,
                           connection: Connection): Promise<SellResponse> {
  const tokenSize = 1;
  const mintKey = new web3.PublicKey(mint);

  // @ts-ignore
  const auctionHouseKey = auctionHouseWithDetails.auctionHouseKey;

  // @ts-ignore
  const anchorProgram = auctionHouseWithDetails.anchorProgram;
  // @ts-ignore
  const auctionHouseObj = auctionHouseWithDetails.auctionHouseObj;

  const buyPriceAdjusted = new anchor.BN(
    await getPriceWithMantissa(
      buyPrice,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      walletWrapper,
      anchorProgram,
    ),
  );

  const tokenSizeAdjusted = new anchor.BN(
    await getPriceWithMantissa(
      tokenSize,
      mintKey,
      walletWrapper,
      anchorProgram,
    ),
  );

  const largestAccount = (await connection.getTokenLargestAccounts(mintKey)).value[0];
  const tokenAccountKey = await getAtaForMint(mintKey, walletWrapper!.publicKey);
  const instructions = [];
  if (largestAccount.address.toBase58() != tokenAccountKey.toBase58()) {
    const accountInfo = await connection.getParsedAccountInfo(tokenAccountKey);
    if (accountInfo.value === null) {
      console.log("\naccountInfo.value === null");
      instructions.push(createAssociatedTokenAccountInstruction(tokenAccountKey, walletWrapper!.publicKey, walletWrapper!.publicKey, mintKey));
    }
    // @ts-ignore
    if (!accountInfo.value || (accountInfo.value && accountInfo.value.data?.parsed.info.tokenAmount.uiAmount === 0)) {
      instructions.push(getTransferInstructions(largestAccount.address, tokenAccountKey, walletWrapper!.publicKey));
    }
  }

  const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner();

  const [tradeState, tradeBump] = await getAuctionHouseTradeState(
    auctionHouseKey,
    walletWrapper!.publicKey,
    tokenAccountKey,
    //@ts-ignore
    auctionHouseObj.treasuryMint,
    mintKey,
    tokenSizeAdjusted,
    buyPriceAdjusted,
  );

  const [freeTradeState, freeTradeBump] = await getAuctionHouseTradeState(
    auctionHouseKey,
    walletWrapper!.publicKey,
    tokenAccountKey,
    //@ts-ignore
    auctionHouseObj.treasuryMint,
    mintKey,
    tokenSizeAdjusted,
    new anchor.BN(0),
  );

  const signers: anchor.web3.Keypair[] = [];

  const instruction = await anchorProgram.instruction.sell(
    tradeBump,
    freeTradeBump,
    programAsSignerBump,
    buyPriceAdjusted,
    tokenSizeAdjusted,
    {
      accounts: {
        wallet: walletWrapper!.publicKey,
        metadata: await getMetadata(mintKey),
        tokenAccount: tokenAccountKey,
        //@ts-ignore
        authority: auctionHouseObj.authority,
        auctionHouse: auctionHouseKey,
        //@ts-ignore
        auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
        sellerTradeState: tradeState,
        freeSellerTradeState: freeTradeState,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        programAsSigner,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers,
    },
  );
  instructions.push(instruction)

  const txData = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletWrapper,
    instructions,
    signers,
    'max',
  );

  let sellResponse: SellResponse = {
    txn: txData.txid,
    seller_wallet: walletWrapper?.publicKey.toBase58(),
    mint: mint,
    price: buyPrice,
    auction_house: auctionHouseKey.toBase58(),
    status: 'open',
    error: txData.error
  }
  return sellResponse;
}



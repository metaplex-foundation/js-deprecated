import { BN, web3 } from '@project-serum/anchor';
import {AnchorWallet} from "@solana/wallet-adapter-react";
import {ASSOCIATED_TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {ExecuteSaleResponse, Metadata} from "./helpers/types";
import {
  decodeMetadata,
  getAtaForMint,
  getAuctionHouseBuyerEscrow, getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState, getMetadata,
  getPriceWithMantissa
} from "./helpers/helpers";
import {TOKEN_PROGRAM_ID} from "./helpers/constants";
import {sendTransactionWithRetryWithKeypair} from "./helpers/transactions";

export async function executeSale(auctionHouseWithDetails: object,
                                  walletWrapper: AnchorWallet | undefined,
                                  mint: string,
                                  buyPrice: number,
                                  buyerWalletPubKey: web3.PublicKey,
                                  sellerWalletPubKey: web3.PublicKey): Promise<ExecuteSaleResponse> {

  const tokenSize = 1;
  // @ts-ignore
  const auctionHouseKey = auctionHouseWithDetails.auctionHouseKey;
  const mintKey = new web3.PublicKey(mint);
  // @ts-ignore
  const anchorProgram = auctionHouseWithDetails.anchorProgram;
  // @ts-ignore
  const auctionHouseObj = auctionHouseWithDetails.auctionHouseObj;

  //@ts-ignore
  const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT);
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

  const tokenAccountKey = await getAtaForMint(mintKey, sellerWalletPubKey);

  const buyerTradeState = (
    await getAuctionHouseTradeState(
      auctionHouseKey,
      buyerWalletPubKey,
      tokenAccountKey,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      mintKey,
      tokenSizeAdjusted,
      buyPriceAdjusted,
    )
  )[0];

  const sellerTradeState = (
    await getAuctionHouseTradeState(
      auctionHouseKey,
      sellerWalletPubKey,
      tokenAccountKey,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      mintKey,
      tokenSizeAdjusted,
      buyPriceAdjusted,
    )
  )[0];

  const [freeTradeState, freeTradeStateBump] =
    await getAuctionHouseTradeState(
      auctionHouseKey,
      sellerWalletPubKey,
      tokenAccountKey,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      mintKey,
      tokenSizeAdjusted,
      new BN(0),
    );
  const [escrowPaymentAccount, bump] = await getAuctionHouseBuyerEscrow(
    auctionHouseKey,
    buyerWalletPubKey,
  );
  const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner();
  const metadata = await getMetadata(mintKey);

  const metadataObj = await anchorProgram.provider.connection.getAccountInfo(metadata,);
  const metadataDecoded: Metadata = decodeMetadata(
    // @ts-ignore
    Buffer.from(metadataObj.data),
  );

  const remainingAccounts = [];

  // @ts-ignore
  for (let i = 0; i < metadataDecoded.data.creators.length; i++) {
    remainingAccounts.push({
      // @ts-ignore
      pubkey: new web3.PublicKey(metadataDecoded.data.creators[i].address),
      isWritable: true,
      isSigner: false,
    });
    if (!isNative) {
      remainingAccounts.push({
        pubkey: await getAtaForMint(
          //@ts-ignore
          auctionHouseObj.treasuryMint,
          remainingAccounts[remainingAccounts.length - 1].pubkey
        ),
        isWritable: true,
        isSigner: false,
      });
    }
  }
  const signers: any[] = [];
  //@ts-ignore
  const tMint: web3.PublicKey = auctionHouseObj.treasuryMint;

  const instruction = await anchorProgram.instruction.executeSale(
    bump,
    freeTradeStateBump,
    programAsSignerBump,
    buyPriceAdjusted,
    tokenSizeAdjusted,
    {
      accounts: {
        buyer: buyerWalletPubKey,
        seller: sellerWalletPubKey,
        metadata,
        tokenAccount: tokenAccountKey,
        tokenMint: mintKey,
        escrowPaymentAccount,
        treasuryMint: tMint,
        sellerPaymentReceiptAccount: isNative
          ? sellerWalletPubKey
          : await getAtaForMint(tMint, sellerWalletPubKey),
        buyerReceiptTokenAccount: await getAtaForMint(mintKey, buyerWalletPubKey),
        //@ts-ignore
        authority: auctionHouseObj.authority,
        auctionHouse: auctionHouseKey,
        //@ts-ignore
        auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
        //@ts-ignore
        auctionHouseTreasury: auctionHouseObj.auctionHouseTreasury,
        sellerTradeState,
        buyerTradeState,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        programAsSigner,
        rent: web3.SYSVAR_RENT_PUBKEY,
        freeTradeState,
      },
      remainingAccounts,
      signers,
    },
  );

  const txData = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletWrapper,
    [instruction],
    signers,
    'max',
  );

  let execute_sale : ExecuteSaleResponse = {
    txn: txData.txid,
    buyer_wallet: buyerWalletPubKey.toBase58(),
    seller_wallet: sellerWalletPubKey.toBase58(),
    mint: mint,
    price: buyPrice,
    auction_house: auctionHouseKey.toBase58(),
    error: txData.error
  }
  if (window.location.hostname === "localhost") {
    console.log("ExecuteSaleResponse => ", JSON.stringify(execute_sale, null, 2));
  }
  return execute_sale;
}

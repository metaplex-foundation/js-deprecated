import {BN, web3} from '@project-serum/anchor';
import {AnchorWallet} from "@solana/wallet-adapter-react";
import {ASSOCIATED_TOKEN_PROGRAM_ID, Token} from "@solana/spl-token";
import {BuyAndExecuteSaleResponse, InstructionsAndSignersSet, Metadata} from "./helpers/types";
import {
  decodeMetadata,
  getAtaForMint,
  getAuctionHouseBuyerEscrow, getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState, getMetadata,
  getPriceWithMantissa
} from "./helpers/helpers";
import {TOKEN_PROGRAM_ID} from "./helpers/constants";
import {sendTransactionWithRetryWithKeypair} from "./helpers/transactions";


export async function buyInstructions(auctionHouseWithDetails: object,
                                      walletWrapper: AnchorWallet | undefined,
                                      mint: string,
                                      buyPrice: number): Promise<InstructionsAndSignersSet> {
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

  const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
    auctionHouseKey,
    walletWrapper!.publicKey,
  );

  const results = await anchorProgram.provider.connection.getTokenLargestAccounts(mintKey);

  const tokenAccountKey: web3.PublicKey = results.value[0].address;

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

  //@ts-ignore
  const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT);

  const ata = await getAtaForMint(
    //@ts-ignore
    auctionHouseObj.treasuryMint,
    walletWrapper!.publicKey,
  );

  const transferAuthority = web3.Keypair.generate();
  const signers = isNative ? [] : [transferAuthority];
  const instruction = await anchorProgram.instruction.buy(
    tradeBump,
    escrowBump,
    buyPriceAdjusted,
    tokenSizeAdjusted,
    {
      accounts: {
        wallet: walletWrapper!.publicKey,
        paymentAccount: isNative ? walletWrapper!.publicKey : ata,
        transferAuthority: isNative
          ? web3.SystemProgram.programId
          : transferAuthority.publicKey,
        metadata: await getMetadata(mintKey),
        tokenAccount: tokenAccountKey,
        escrowPaymentAccount,
        //@ts-ignore
        treasuryMint: auctionHouseObj.treasuryMint,
        //@ts-ignore
        authority: auctionHouseObj.authority,
        auctionHouse: auctionHouseKey,
        //@ts-ignore
        auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
        buyerTradeState: tradeState,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
    },
  );

  if (!isNative) {
    // @ts-ignore
    instruction.keys
    // @ts-ignore
    .filter(k => k.pubkey.equals(transferAuthority.publicKey))
    // @ts-ignore
    .map(k => (k.isSigner = true));
  }

  const instructions = [
    ...(isNative
      ? []
      : [
        Token.createApproveInstruction(
          TOKEN_PROGRAM_ID,
          ata,
          transferAuthority.publicKey,
          walletWrapper!.publicKey,
          [],
          buyPriceAdjusted.toNumber(),
        ),
      ]),

    instruction,
    ...(isNative
      ? []
      : [
        Token.createRevokeInstruction(
          TOKEN_PROGRAM_ID,
          ata,
          walletWrapper!.publicKey,
          [],
        ),
      ]),
  ];

  return {
    signers: signers,
    instructions: instructions
  }
}


export async function executeSale(auctionHouseWithDetails: object,
                                  walletWrapper: AnchorWallet | undefined,
                                  mint: string,
                                  buyPrice: number,
                                  buyerWalletPubKey: web3.PublicKey,
                                  sellerWalletPubKey: web3.PublicKey): Promise<any> {

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

  return {
    signers: signers,
    instructions: [instruction]
  }
}

export async function buyAndExecuteSale(auctionHouseWithDetails: object,
                                        walletWrapper: AnchorWallet | undefined,
                                        mint: string,
                                        buyPrice: number,
                                        buyerWalletPubKey: web3.PublicKey,
                                        sellerWalletPubKey: web3.PublicKey): Promise<BuyAndExecuteSaleResponse> {
  // @ts-ignore
  const auctionHouseKey = auctionHouseWithDetails.auctionHouseKey;
  new web3.PublicKey(mint);
// @ts-ignore
  const anchorProgram = auctionHouseWithDetails.anchorProgram;
  // @ts-ignore
  const buyInstructionsArray = await buyInstructions(auctionHouseWithDetails, walletWrapper, mint, buyPrice);
  const executeSaleInstructionArray = await executeSale(auctionHouseWithDetails, walletWrapper, mint, buyPrice, buyerWalletPubKey, sellerWalletPubKey);
  const instructionsArray = [buyInstructionsArray.instructions, executeSaleInstructionArray.instructions].flat();
  const signersArray = [buyInstructionsArray.signers, executeSaleInstructionArray.signers].flat();

  const txData = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletWrapper,
    instructionsArray,
    signersArray,
    'max',
  );

  let buyAndExecuteSaleResponse: BuyAndExecuteSaleResponse = {
    txn: txData.txid,
    buyer_wallet: buyerWalletPubKey.toBase58(),
    seller_wallet: sellerWalletPubKey.toBase58(),
    mint: mint,
    price: buyPrice,
    auction_house: auctionHouseKey.toBase58(),
    error: txData.error
  }
  return buyAndExecuteSaleResponse;
}

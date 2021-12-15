import { BN, web3 } from '@project-serum/anchor';
import {AnchorWallet} from "@solana/wallet-adapter-react";
import {
  WRAPPED_SOL_MINT,
  TOKEN_PROGRAM_ID
} from "../../helpers/constants.ts";
import {Token} from "@solana/spl-token";
import {BuyResponse, Txn} from "./helpers/types";
import {
  getAtaForMint,
  getAuctionHouseBuyerEscrow,
  getAuctionHouseTradeState, getMetadata,
  getPriceWithMantissa
} from "./helpers/helpers";
import {sendTransactionWithRetryWithKeypair} from "./helpers/transactions";

export async function buy(auctionHouseWithDetails: object,
                          walletWrapper: AnchorWallet | undefined,
                          mint: string,
                          buyPrice: number): Promise<BuyResponse> {
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
  const txData: Txn = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletWrapper,
    instructions,
    signers,
    'max',
  );

  let buyReponse: BuyResponse = {
    txn: txData.txid,
    buyer_wallet: walletWrapper?.publicKey.toBase58(),
    mint: mint,
    price: buyPrice,
    auction_house: auctionHouseKey.toBase58(),
    status: 'open',
    error: txData.error
  }
  return buyReponse;
}

import { BN, web3 } from "@project-serum/anchor";
import {
  getAtaForMint,
  getAuctionHouseBuyerEscrow,
  getTokenAmount,
  getPriceWithMantissa
} from "../../helpers/metaplex-helpers";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { WRAPPED_SOL_MINT, TOKEN_PROGRAM_ID } from "../../helpers/constants.ts";
import { Token } from "@solana/spl-token";
import { sendTransactionWithRetryWithKeypair } from "../../helpers/transactions";

export async function deposit(auctionHouseWithDetails: object,
                              walletWrapper: AnchorWallet | undefined,
                              amount: number) {
  // @ts-ignore
  const auctionHouseKey = auctionHouseWithDetails.auctionHouseKey;
  // @ts-ignore
  const anchorProgram = auctionHouseWithDetails.anchorProgram;
  // @ts-ignore
  const auctionHouseObj = auctionHouseWithDetails.auctionHouseObj;

  const amountAdjusted = await getPriceWithMantissa(
    amount,
    //@ts-ignore
    auctionHouseObj.treasuryMint,
    walletWrapper,
    anchorProgram
  );
  const [escrowPaymentAccount, bump] = await getAuctionHouseBuyerEscrow(
    auctionHouseKey,
    walletWrapper!.publicKey
  );

  //@ts-ignore
  const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT);

  const ata = await getAtaForMint(
    //@ts-ignore
    auctionHouseObj.treasuryMint,
    walletWrapper!.publicKey
  );

  const transferAuthority = web3.Keypair.generate();
  const signers = isNative ? [] : [transferAuthority];
  const instruction = await anchorProgram.instruction.deposit(
    bump,
    new BN(amountAdjusted),
    {
      accounts: {
        wallet: walletWrapper!.publicKey,
        paymentAccount: isNative ? walletWrapper!.publicKey : ata,
        transferAuthority: isNative
          ? web3.SystemProgram.programId
          : transferAuthority.publicKey,
        escrowPaymentAccount,
        //@ts-ignore
        treasuryMint: auctionHouseObj.treasuryMint,
        //@ts-ignore
        authority: auctionHouseObj.authority,
        auctionHouse: auctionHouseKey,
        //@ts-ignore
        auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
    }
  );

  if (!isNative) {
    instruction.keys
    // @ts-ignore
    .filter((k) => k.pubkey.equals(transferAuthority.publicKey))
    // @ts-ignore
    .map((k) => (k.isSigner = true));
  }

  const currBal = await getTokenAmount(
    anchorProgram,
    escrowPaymentAccount,
    //@ts-ignore
    auctionHouseObj.treasuryMint
  );

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
          amountAdjusted
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
          []
        ),
      ]),
  ];
  const txData = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletWrapper,
    instructions,
    signers,
    "max"
  );

  let depositResponse = {
    txn: txData.txid,
    buyer_wallet: walletWrapper?.publicKey.toBase58(),
    amount: amount,
    auction_house: auctionHouseKey.toBase58(),
  };
}

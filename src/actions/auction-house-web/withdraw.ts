import { BN, web3 } from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {WithdrawResponse} from "./helpers/types";
import {getAtaForMint, getAuctionHouseBuyerEscrow, getPriceWithMantissa, getTokenAmount} from "./helpers/helpers";
import {TOKEN_PROGRAM_ID} from "./helpers/constants";
import {sendTransactionWithRetryWithKeypair} from "./helpers/transactions";

export async function withdraw(
  auctionHouseWithDetails: object,
  walletWrapper: AnchorWallet | undefined,
  amount: number
): Promise<WithdrawResponse> {
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
  const signers: any[] = [];

  const currBal = await getTokenAmount(
    anchorProgram,
    escrowPaymentAccount,
    //@ts-ignore
    auctionHouseObj.treasuryMint
  );

  const instruction = await anchorProgram.instruction.withdraw(
    bump,
    new BN(amountAdjusted),
    {
      accounts: {
        wallet: walletWrapper!.publicKey,
        receiptAccount: isNative ? walletWrapper!.publicKey : ata,
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
        ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
      signers,
    }
  );

  instruction.keys
  // @ts-ignore
  .filter((k) => k.pubkey.equals(walletWrapper.publicKey))
  // @ts-ignore
  .map((k) => (k.isSigner = true));

  const txData = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletWrapper,
    [instruction],
    signers,
    "max"
  );

  let withdrawResponse : WithdrawResponse = {
    txn: txData.txid,
    buyer_wallet: walletWrapper!.publicKey.toBase58(),
    amount: amount,
    auction_house: auctionHouseKey.toBase58(),
    status: 'open',
    error: txData.error
  };
  return withdrawResponse;
}

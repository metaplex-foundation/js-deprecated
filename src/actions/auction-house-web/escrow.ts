import {AnchorWallet} from "@solana/wallet-adapter-react";
import {EscrowResponse} from "./helpers/types";
import {getAuctionHouseBuyerEscrow, getTokenAmount} from "./helpers/helpers";


export async function showEscrow(auctionHouseWithDetails: object,
                                 walletWrapper: AnchorWallet | undefined): Promise<EscrowResponse> {
  // @ts-ignore
  const auctionHouseKey = auctionHouseWithDetails.auctionHouseKey;

  const escrow = (
    await getAuctionHouseBuyerEscrow(
      // @ts-ignore
      auctionHouseWithDetails.auctionHouseKey,
      walletWrapper!.publicKey
    )
  )[0];

  const amount = await getTokenAmount(
    // @ts-ignore
    auctionHouseWithDetails.anchorProgram,
    escrow,
    //@ts-ignore
    auctionHouseWithDetails.auctionHouseObj.treasuryMint,
  );

  let show_escrow: EscrowResponse = {
    buyer_wallet: walletWrapper!.publicKey.toBase58(),
    escrow: escrow.toBase58(),
    auction_house: auctionHouseKey.toBase58(),
    balance: amount,
  }
  return show_escrow;
}

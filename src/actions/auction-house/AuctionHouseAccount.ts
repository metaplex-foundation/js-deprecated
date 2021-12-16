import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { AuctionHouseProgram } from './AuctionHouseProgram';

export class AuctionHouseAccount {
  static async getAtaForMint(mint: PublicKey, buyer: PublicKey) {
    return PublicKey.findProgramAddress(
      [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
  }

  static async getAuctionHouse(creator: PublicKey, treasuryMint: PublicKey) {
    return AuctionHouseProgram.findProgramAddress([
      Buffer.from(AuctionHouseProgram.PREFIX),
      creator.toBuffer(),
      treasuryMint.toBuffer(),
    ]);
  }

  static async getAuctionHouseFeeAcct(auctionHouse: PublicKey) {
    return AuctionHouseProgram.findProgramAddress([
      Buffer.from(AuctionHouseProgram.PREFIX),
      auctionHouse.toBuffer(),
      Buffer.from(AuctionHouseProgram.FEE_PAYER),
    ]);
  }

  static async getAuctionHouseTreasuryAcct(auctionHouse: PublicKey) {
    return AuctionHouseProgram.findProgramAddress([
      Buffer.from(AuctionHouseProgram.PREFIX),
      auctionHouse.toBuffer(),
      Buffer.from(AuctionHouseProgram.TREASURY),
    ]);
  }
}

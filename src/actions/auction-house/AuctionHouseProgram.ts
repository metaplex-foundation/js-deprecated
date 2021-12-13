import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { AuctionHouse, IDL } from './idl';

export class AuctionHouseProgram extends anchor.Program<AuctionHouse> {
  static readonly PREFIX = 'auction_house';
  static readonly FEE_PAYER = 'fee_payer';
  static readonly TREASURY = 'treasury';
  static readonly PUBKEY = new PublicKey('hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk');

  constructor(provider: anchor.Provider) {
    super(IDL, AuctionHouseProgram.PUBKEY, provider);
  }

  static async findProgramAddress(seeds: (Buffer | Uint8Array)[]) {
    return PublicKey.findProgramAddress(seeds, this.PUBKEY);
  }
}

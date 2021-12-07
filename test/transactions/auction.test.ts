import BN from 'bn.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  AUCTION_EXTENDED_PUBKEY,
  AUCTION_PUBKEY,
  FEE_PAYER,
  mockTransaction,
  NEW_AUTHORITY_PUBKEY,
  serializeConfig,
  TOKEN_MINT_PUBKEY,
  VAULT_PUBKEY,
} from '../utils';
import {
  CreateAuctionV2,
  CreateAuctionV2Args,
  CreateAuction,
  CreateAuctionArgs,
  PriceFloor,
  PriceFloorType,
  WinnerLimit,
  WinnerLimitType,
} from '@metaplex-foundation/mpl-auction';

describe('Auction transactions', () => {
  test('CreateAuction', async () => {
    const data = new CreateAuction(mockTransaction, {
      auction: AUCTION_PUBKEY,
      auctionExtended: AUCTION_EXTENDED_PUBKEY,
      creator: FEE_PAYER.publicKey,
      args: new CreateAuctionArgs({
        winners: new WinnerLimit({ type: WinnerLimitType.Capped, usize: new BN(1) }),
        endAuctionAt: new BN(1636987843),
        auctionGap: new BN(30),
        tokenMint: TOKEN_MINT_PUBKEY.toString(),
        authority: NEW_AUTHORITY_PUBKEY.toString(),
        resource: VAULT_PUBKEY.toString(),
        priceFloor: new PriceFloor({ type: PriceFloorType.Minimum }),
        tickSize: new BN(10),
        gapTickSizePercentage: 1,
      }),
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('CreateAuctionV2', async () => {
    const data = new CreateAuctionV2(mockTransaction, {
      auction: AUCTION_PUBKEY,
      auctionExtended: AUCTION_EXTENDED_PUBKEY,
      creator: FEE_PAYER.publicKey,
      args: new CreateAuctionV2Args({
        winners: new WinnerLimit({ type: WinnerLimitType.Capped, usize: new BN(1) }),
        endAuctionAt: new BN(1636987843),
        auctionGap: new BN(30),
        tokenMint: TOKEN_MINT_PUBKEY.toString(),
        authority: NEW_AUTHORITY_PUBKEY.toString(),
        resource: VAULT_PUBKEY.toString(),
        priceFloor: new PriceFloor({ type: PriceFloorType.Minimum }),
        tickSize: new BN(10),
        gapTickSizePercentage: 1,
        instantSalePrice: new BN(LAMPORTS_PER_SOL),
        name: null,
      }),
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });
});

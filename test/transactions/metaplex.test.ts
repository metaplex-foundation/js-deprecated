import {
  AUCTION_EXTENDED_PUBKEY,
  AUCTION_MANAGER_PUBKEY,
  AUCTION_PUBKEY,
  BID_METADATA_PUBKEY,
  BID_REDEMPTION_PUBKEY,
  CURRENT_AUTHORITY_PUBKEY,
  EDITION_MARK_PUBKEY,
  FEE_PAYER,
  MASTER_EDITION_PUBKEY,
  METADATA_PUBKEY,
  mockTransaction,
  NEW_EDITION_PUBKEY,
  NEW_METADATA_PUBKEY,
  PRIZE_TRACKING_TICKET_PUBKEY,
  SAFETY_DEPOSIT_BOX_PUBKEY,
  SAFETY_DEPOSIT_CONFIG_PUBKEY,
  SAFETY_DEPOSIT_TOKEN_STORE_PUBKEY,
  serializeConfig,
  STORE_PUBKEY,
  TOKEN_ACCOUNT_PUBKEY,
  TOKEN_MINT_PUBKEY,
  VAULT_PUBKEY,
} from '../utils';
import { EndAuction, RedeemPrintingV2Bid } from '@metaplex-foundation/mpl-metaplex';
import BN from 'bn.js';

describe('Metaplex transactions', () => {
  test('EndAuction(reveal = null)', async () => {
    const data = new EndAuction(mockTransaction, {
      auctionManager: AUCTION_MANAGER_PUBKEY,
      auction: AUCTION_PUBKEY,
      auctionExtended: AUCTION_EXTENDED_PUBKEY,
      store: STORE_PUBKEY,
      auctionManagerAuthority: CURRENT_AUTHORITY_PUBKEY,
      reveal: null,
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  // TODO: find out how to correctly define schema for (u64, u64) Rust type
  // test('EndAuction(reveal = BN[])', async () => {
  //   const data = new EndAuction(mockTransaction, {
  //     auctionManager: AUCTION_MANAGER_PUBKEY,
  //     auction: AUCTION_PUBKEY,
  //     auctionExtended: AUCTION_EXTENDED_PUBKEY,
  //     store: STORE_PUBKEY,
  //     auctionManagerAuthority: CURRENT_AUTHORITY_PUBKEY,
  //     reveal: [new BN(1), new BN(1)],
  //   });

  //   const serializedData = data.serialize(serializeConfig);
  //   expect(JSON.stringify(serializedData)).toMatchSnapshot();
  // });

  test('RedeemPrintingV2Bid', async () => {
    const data = new RedeemPrintingV2Bid(mockTransaction, {
      store: STORE_PUBKEY,
      vault: VAULT_PUBKEY,
      auction: AUCTION_PUBKEY,
      auctionManager: AUCTION_PUBKEY,
      bidRedemption: BID_REDEMPTION_PUBKEY,
      bidMetadata: BID_METADATA_PUBKEY,
      safetyDepositTokenStore: SAFETY_DEPOSIT_TOKEN_STORE_PUBKEY,
      destination: TOKEN_ACCOUNT_PUBKEY,
      safetyDeposit: SAFETY_DEPOSIT_BOX_PUBKEY,
      bidder: FEE_PAYER.publicKey,
      safetyDepositConfig: SAFETY_DEPOSIT_CONFIG_PUBKEY,
      auctionExtended: AUCTION_EXTENDED_PUBKEY,
      newMint: TOKEN_MINT_PUBKEY,
      newEdition: NEW_EDITION_PUBKEY,
      newMetadata: NEW_METADATA_PUBKEY,
      metadata: METADATA_PUBKEY,
      masterEdition: MASTER_EDITION_PUBKEY,
      editionMark: EDITION_MARK_PUBKEY,
      prizeTrackingTicket: PRIZE_TRACKING_TICKET_PUBKEY,
      winIndex: new BN(0),
      editionOffset: new BN(0),
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });
});

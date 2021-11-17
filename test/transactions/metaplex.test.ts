import {
  AUCTION_EXTENDED_PUBKEY,
  AUCTION_MANAGER_PUBKEY,
  AUCTION_PUBKEY,
  CURRENT_AUTHORITY_PUBKEY,
  mockTransaction,
  serializeConfig,
  STORE_PUBKEY,
} from '../utils';
import { EndAuction } from '../../src/programs/metaplex/transactions/EndAuction';
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
});

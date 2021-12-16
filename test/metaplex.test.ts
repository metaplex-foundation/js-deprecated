import { jest } from '@jest/globals';
import { Connection } from '../src';
import { Auction } from '@metaplex-foundation/mpl-auction';
import {
  Store,
  MetaplexKey,
  AuctionManager,
  PayoutTicket,
} from '@metaplex-foundation/mpl-metaplex';
import {
  AUCTION_MANAGER_PUBKEY,
  AUCTION_PUBKEY,
  STORE_OWNER_PUBKEY,
  STORE_PUBKEY,
  VAULT_PUBKEY,
} from './utils';

describe('Metaplex', () => {
  let connection: Connection;

  jest.setTimeout(80000);

  beforeAll(() => {
    connection = new Connection('devnet');
  });

  describe('Store', () => {
    test('getPDA', async () => {
      const storeId = await Store.getPDA(STORE_OWNER_PUBKEY);

      expect(storeId).toEqual(STORE_PUBKEY);
    });

    test('load', async () => {
      const store = await Store.load(connection, STORE_PUBKEY);

      expect(store.data.key).toEqual(MetaplexKey.StoreV1);
    });

    test('getAuctionManagers', async () => {
      const store = await Store.load(connection, STORE_PUBKEY);
      const auctionManagers = await store.getAuctionManagers(connection);

      expect(auctionManagers[0].data.store).toEqual(STORE_PUBKEY.toString());
    });
  });

  describe('Auction Manager', () => {
    test('getPDA', async () => {
      const auctionPDA = await Auction.getPDA(VAULT_PUBKEY);
      const auctionManagerPDA = await AuctionManager.getPDA(auctionPDA);

      expect(auctionPDA).toEqual(AUCTION_PUBKEY);
      expect(auctionManagerPDA).toEqual(AUCTION_MANAGER_PUBKEY);
    });

    test('load', async () => {
      const auctionManager = await AuctionManager.load(connection, AUCTION_MANAGER_PUBKEY);

      expect(auctionManager.data.key).toEqual(MetaplexKey.AuctionManagerV2);
    });

    test('findMany', async () => {
      const auctionManagers = await AuctionManager.findMany(connection, {
        store: STORE_PUBKEY,
        authority: STORE_OWNER_PUBKEY,
      });
      expect(auctionManagers[0].data.store).toEqual(STORE_PUBKEY.toString());
    });

    test('getAuction', async () => {
      const auctionManager = await AuctionManager.load(connection, AUCTION_MANAGER_PUBKEY);
      const auction = await auctionManager.getAuction(connection);

      expect(auction.pubkey).toEqual(AUCTION_PUBKEY);
    });

    test('getBidRedemptionTickets', async () => {
      const auctionManager = await AuctionManager.load(connection, AUCTION_MANAGER_PUBKEY);
      await auctionManager.getBidRedemptionTickets(connection);
    });
  });

  describe('Payout Ticket', () => {
    test('load', async () => {});

    test('getPayoutTickets', async () => {
      await PayoutTicket.getPayoutTicketsByRecipient(connection, STORE_OWNER_PUBKEY);
    });
  });
});

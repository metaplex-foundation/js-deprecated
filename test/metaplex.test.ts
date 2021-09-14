import { PublicKey } from '@solana/web3.js';
import { AuctionManager, Connection, MetaplexKey, PayoutTicket, Store } from '../src';

const STORE_OWNER_PUBKEY = new PublicKey('7hKMAoCYJuBnBLmVTjswu7m6jcwyE8MYAP5hPijUT6nd');
const STORE_PUBKEY = new PublicKey('DNQzo4Aggw8PneX7BGY7niEkB8wfNJwx6DpV9BLBUUFF');
const AUCTION_MANAGER_PUBKEY = new PublicKey('Gjd1Mo8KLEgywxMKaDRhaoD2Fu8bzoVLZ8H7v761XXkf');

describe('Metaplex', () => {
  let connection: Connection;

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
    test('load', async () => {
      const auctionManager = await AuctionManager.load(connection, AUCTION_MANAGER_PUBKEY);

      expect(auctionManager.data.key).toEqual(MetaplexKey.AuctionManagerV2);
    });

    test('getBidRedemptionTickets', async () => {
      const auctionManager = await AuctionManager.load(connection, AUCTION_MANAGER_PUBKEY);
      const bidRedemptionTickets = await auctionManager.getBidRedemptionTickets(connection);
    });
  });

  describe('Payout Ticket', () => {
    test('load', async () => {});

    test('getPayoutTickets', async () => {
      const payoutTickets = await PayoutTicket.getPayoutTicketsByRecipient(
        connection,
        STORE_OWNER_PUBKEY,
      );
    });
  });
});

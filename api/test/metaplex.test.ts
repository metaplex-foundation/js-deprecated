import { jest } from '@jest/globals';
import { Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import {
  Auction,
  AuctionManager,
  Connection,
  MetaplexKey,
  PayoutTicket,
  SetStore,
  Store,
} from '../src';
import {
  AUCTION_MANAGER_PUBKEY,
  AUCTION_PUBKEY,
  FEE_PAYER,
  STORE_OWNER_PUBKEY,
  STORE_PUBKEY,
  VAULT_PUBKEY,
} from './utils';

describe('Metaplex', () => {
  let connection: Connection;
  let owner: Keypair;

  jest.setTimeout(80000);

  beforeAll(() => {
    connection = new Connection('devnet');
    owner = Keypair.generate();
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

    test.skip('setStore', async () => {
      const storeId = await Store.getPDA(owner.publicKey);

      const setStoreTx = new SetStore(
        {
          feePayer: FEE_PAYER.publicKey,
        },
        {
          admin: owner.publicKey,
          store: storeId,
          isPublic: true,
        },
      );

      const txid = await sendAndConfirmTransaction(connection, setStoreTx, [FEE_PAYER, owner], {
        commitment: 'confirmed',
      });

      // console.log(txid);
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

    test('getAuction', async () => {
      const auctionManager = await AuctionManager.load(connection, AUCTION_MANAGER_PUBKEY);
      const auction = await auctionManager.getAuction(connection);

      expect(auction.pubkey).toEqual(AUCTION_PUBKEY);
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

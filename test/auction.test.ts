import { Auction, AuctionState, AuctionExtended } from '@metaplex-foundation/mpl-auction';
import { Connection } from '../src';
import {
  AUCTION_EXTENDED_PUBKEY,
  AUCTION_MANAGER_PUBKEY,
  AUCTION_PUBKEY,
  NETWORK,
  VAULT_PUBKEY,
} from './utils';

describe('Auction', () => {
  let connection: Connection;

  beforeAll(() => {
    connection = new Connection(NETWORK);
  });

  describe('Auction', () => {
    test('load', async () => {
      const auction = await Auction.load(connection, AUCTION_PUBKEY);

      expect(auction.pubkey).toEqual(AUCTION_PUBKEY);
      expect(auction.data.state).toEqual(AuctionState.Started);
    });

    test('findMany', async () => {
      const auctions = await Auction.findMany(connection, { authority: AUCTION_MANAGER_PUBKEY });
      expect(auctions[0].data.authority).toEqual(AUCTION_MANAGER_PUBKEY.toString());
    });

    test('getBidderPots', async () => {
      const auction = await Auction.load(connection, AUCTION_PUBKEY);
      const bidderPots = await auction.getBidderPots(connection);

      expect(bidderPots[0].data.auctionAct).toEqual(AUCTION_PUBKEY.toString());
    });

    test('getBidderMetadata', async () => {
      const auction = await Auction.load(connection, AUCTION_PUBKEY);
      const bidderMetadata = await auction.getBidderMetadata(connection);

      expect(bidderMetadata[0].data.auctionPubkey).toEqual(AUCTION_PUBKEY.toString());
    });
  });

  describe('Auction Extended', () => {
    test('getPDA', async () => {
      const auctionExtendedPDA = await AuctionExtended.getPDA(VAULT_PUBKEY);

      expect(auctionExtendedPDA).toEqual(AUCTION_EXTENDED_PUBKEY);
    });

    test('load', async () => {
      const auctionExtended = await AuctionExtended.load(connection, AUCTION_EXTENDED_PUBKEY);

      expect(auctionExtended.pubkey).toEqual(AUCTION_EXTENDED_PUBKEY);
      expect(auctionExtended.data.totalUncancelledBids).toBeDefined();
    });
  });
});

import { Auction, AuctionExtended, AuctionState, Connection } from '../src';
import { AUCTION_EXTENDED_PUBKEY, AUCTION_PUBKEY, VAULT_PUBKEY } from './utils';

describe('Auction', () => {
  let connection: Connection;

  beforeAll(() => {
    connection = new Connection('devnet');
  });

  describe('Auction', () => {
    test('load', async () => {
      const auction = await Auction.load(connection, AUCTION_PUBKEY);

      expect(auction.pubkey).toEqual(AUCTION_PUBKEY);
      expect(auction.data.state).toEqual(AuctionState.Started);
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
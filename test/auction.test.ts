import { PublicKey } from '@solana/web3.js'
import { Auction, AuctionState, Connection } from '../src'

const AUCTION_PUBKEY = new PublicKey('BTE7AqJn4aG2MKZnaSTEgbQ4aCgPTDmphs5uxDnuDqvQ')

describe('Auction', () => {
  let connection: Connection

  beforeAll(() => {
    connection = new Connection('devnet')
  })

  describe('Auction', () => {
    test('get auction account', async () => {
      const auction = await Auction.load(connection, AUCTION_PUBKEY)

      expect(auction.pubkey).toEqual(AUCTION_PUBKEY)
      expect(auction.data.state).toEqual(AuctionState.Started)
    })

    test('get auction bidder pots', async () => {
      const auction = await Auction.load(connection, AUCTION_PUBKEY)
      const bidderPots = await auction.getBidderPots(connection)

      expect(bidderPots[0].data.auctionAct).toEqual(AUCTION_PUBKEY.toString())
    })

    test('get auction bidder metadata', async () => {
      const auction = await Auction.load(connection, AUCTION_PUBKEY)
      const bidderMetadata = await auction.getBidderMetadata(connection)

      expect(bidderMetadata[0].data.auctionPubkey).toEqual(AUCTION_PUBKEY.toString())
    })
  })
})

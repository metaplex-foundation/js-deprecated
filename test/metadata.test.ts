import { PublicKey } from '@solana/web3.js'
import { Connection, Metadata, MetadataKey } from '../src'

describe('Metadata', () => {
  let connection: Connection

  beforeAll(() => {
    connection = new Connection('devnet')
  })

  describe('Metadata', () => {
    test('get metadata account', async () => {
      const pubkey = new PublicKey('AgTwrtqDT1xmWEttFZ5p6S8kkn4SyyGNQgG1wwp3DELc')
      const metadata = await Metadata.load(connection, pubkey)

      expect(metadata.pubkey).toEqual(pubkey)
      expect(metadata.data.key).toEqual(MetadataKey.MetadataV1)
    })
  })
})

import { PublicKey } from '@solana/web3.js'
import { Connection, MetaplexKey, Store } from '../src'

const STORE_OWNER_PUBKEY = new PublicKey('7hKMAoCYJuBnBLmVTjswu7m6jcwyE8MYAP5hPijUT6nd')
const STORE_PUBKEY = new PublicKey('DNQzo4Aggw8PneX7BGY7niEkB8wfNJwx6DpV9BLBUUFF')

describe('Metaplex', () => {
  let connection: Connection

  beforeAll(() => {
    connection = new Connection('devnet')
  })

  describe('Store', () => {
    test('get store id', async () => {
      const storeId = await Store.getPDA(STORE_OWNER_PUBKEY)

      expect(storeId).toEqual(STORE_PUBKEY)
    })

    test('get store account', async () => {
      const store = await Store.load(connection, STORE_PUBKEY)

      expect(store.data.key).toEqual(MetaplexKey.StoreV1)
    })
  })
})

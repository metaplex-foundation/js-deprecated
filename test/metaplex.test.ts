import { Connection } from '../src'

describe('Metaplex', () => {
  let connection: Connection

  beforeAll(() => {
    connection = new Connection('devnet')
  })

  describe('Store', () => {
    test('get store account', async () => {})
  })
})

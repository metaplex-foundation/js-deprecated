import { Connection, PackSet, PackSetState } from '../src';
import { PACKSET_PUBKEY } from './utils';

describe('Packs', () => {
  let connection: Connection;

  beforeAll(() => {
    connection = new Connection('devnet');
  });

  describe('Pack Set', () => {
    test('load', async () => {
      // const packSet = await PackSet.load(connection, PACKSET_PUBKEY);
      // expect(packSet.pubkey).toEqual(PACKSET_PUBKEY);
      // expect(packSet.data.state).toEqual(PackSetState.NotActivated);
    });
  });

  describe('Pack Card', () => {
    test('load', async () => {});
  });
});

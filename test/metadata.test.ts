import { PublicKey } from '@solana/web3.js';
import { Connection, MasterEdition, Metadata, MetadataKey } from '../src';

const METADATA_PUBKEY = new PublicKey('CZkFeERacU42qjApPyjamS13fNtz7y1wYLu5jyLpN1WL');
const MASTER_EDITION_PUBKEY = new PublicKey('EZ5xB174dcz982WXV2aNr4zSW5ywAH3gP5Lbj8CuRMw4');

describe('Metadata', () => {
  let connection: Connection;

  beforeAll(() => {
    connection = new Connection('devnet');
  });

  describe('Metadata', () => {
    test('load', async () => {
      const metadata = await Metadata.load(connection, METADATA_PUBKEY);

      expect(metadata.pubkey).toEqual(METADATA_PUBKEY);
      expect(metadata.data.key).toEqual(MetadataKey.MetadataV1);
    });
  });

  describe('Master edition', () => {
    test('getEditions', async () => {
      const masterEdition = await MasterEdition.load(connection, MASTER_EDITION_PUBKEY);
      const editions = await masterEdition.getEditions(connection);

      expect(editions[0].data.parent).toEqual(MASTER_EDITION_PUBKEY.toString());
    });
  });
});

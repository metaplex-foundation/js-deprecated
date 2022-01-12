import { Connection } from '../src';
import { MASTER_EDITION_PUBKEY, METADATA_PUBKEY, NETWORK, STORE_OWNER_PUBKEY } from './utils';
import { Metadata, MetadataKey, MasterEdition } from '@metaplex-foundation/mpl-token-metadata';

describe.skip('Metadata', () => {
  let connection: Connection;

  beforeAll(() => {
    connection = new Connection(NETWORK);
  });

  describe('Metadata', () => {
    test('load', async () => {
      const metadata = await Metadata.load(connection, METADATA_PUBKEY);

      expect(metadata.pubkey).toEqual(METADATA_PUBKEY);
      expect(metadata.data.key).toEqual(MetadataKey.MetadataV1);
    });

    test('findMany', async () => {
      const metadata = await Metadata.findMany(connection, {
        creators: [STORE_OWNER_PUBKEY],
      });

      expect(metadata[0].data.key).toBe(MetadataKey.MetadataV1);
    }, 10000);
  });

  describe('Master edition', () => {
    test('getEditions', async () => {
      const masterEdition = await MasterEdition.load(connection, MASTER_EDITION_PUBKEY);
      const editions = await masterEdition.getEditions(connection);

      expect(editions[0].data.parent).toEqual(MASTER_EDITION_PUBKEY.toString());
    }, 10000);
  });
});

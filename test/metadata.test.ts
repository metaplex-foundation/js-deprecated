import { Connection, MasterEdition, Metadata, MetadataKey } from '../src';
import { MASTER_EDITION_PUBKEY, METADATA_PUBKEY } from './utils';

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

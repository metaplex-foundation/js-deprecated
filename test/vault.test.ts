import { Connection } from '../src';
import { NETWORK, VAULT_PUBKEY } from './utils';
import { Vault, VaultKey } from '@metaplex-foundation/mpl-token-vault';

describe('Vault', () => {
  let connection: Connection;

  beforeAll(() => {
    connection = new Connection(NETWORK);
  });

  describe('Vault', () => {
    test('load', async () => {
      const vault = await Vault.load(connection, VAULT_PUBKEY);

      expect(vault.data.key).toEqual(VaultKey.VaultV1);
    });
  });
});

import { Connection } from '../src';
import { VAULT_PUBKEY } from './utils';
import { Vault, VaultKey } from '../src/programs/vault';

describe('Vault', () => {
  let connection: Connection;

  beforeAll(() => {
    connection = new Connection('devnet');
  });

  describe('Vault', () => {
    test('load', async () => {
      const vault = await Vault.load(connection, VAULT_PUBKEY);

      expect(vault.data.key).toEqual(VaultKey.VaultV1);
    });
  });
});

import { NATIVE_MINT } from '@solana/spl-token';
import { Connection, NodeWallet } from '../../src';
import { createVault } from '../../src/actions';
import { FEE_PAYER, pause, VAULT_EXTENRNAL_PRICE_ACCOUNT } from '../utils';
import { Vault, VaultState } from '../../src/programs/vault';

describe('creating a Vault', () => {
  const connection = new Connection('devnet');
  const wallet = new NodeWallet(FEE_PAYER);

  describe('success', () => {
    test('generates vault', async () => {
      const vaultResponse = await createVault({
        connection,
        wallet,
        priceMint: NATIVE_MINT,
        externalPriceAccount: VAULT_EXTENRNAL_PRICE_ACCOUNT,
      });

      await pause(20000);
      const vault = await Vault.load(connection, vaultResponse.vault);
      expect(vault).toHaveProperty('data');
      expect(vault.data.state).toEqual(VaultState.Inactive);
    }, 30000);
  });
});

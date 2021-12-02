import { NATIVE_MINT } from '@solana/spl-token';
import { Connection, NodeWallet } from '../../src';
import { createVault, closeVault } from '../../src/actions';
import { FEE_PAYER, pause, VAULT_EXTENRNAL_PRICE_ACCOUNT } from '../utils';
import { Vault, VaultState } from '../../src/programs/vault';

describe('closing a Vault', () => {
  const connection = new Connection('devnet');
  const wallet = new NodeWallet(FEE_PAYER);

  describe('success', () => {
    test('closes vault', async () => {
      let vault;
      const vaultResponse = await createVault({
        connection,
        wallet,
        priceMint: NATIVE_MINT,
        externalPriceAccount: VAULT_EXTENRNAL_PRICE_ACCOUNT,
      });

      await pause(20000);
      vault = await Vault.load(connection, vaultResponse.vault);
      expect(vault).toHaveProperty('data');
      expect(vault.data.state).toEqual(VaultState.Inactive);

      await closeVault({
        connection,
        wallet,
        vault: vaultResponse.vault,
        priceMint: NATIVE_MINT,
      });

      await pause(20000);

      vault = await Vault.load(connection, vaultResponse.vault);
      expect(vault).toHaveProperty('data');
      expect(vault.data.state).toEqual(VaultState.Combined);
    }, 60000);
  });
});

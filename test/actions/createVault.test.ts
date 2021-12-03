import { Connection, NodeWallet } from '../../src';
import { createVault, createExternalPriceAccount } from '../../src/actions';
import { FEE_PAYER, pause } from '../utils';
import { Vault, VaultState } from '../../src/programs/vault';

describe('creating a Vault', () => {
  const connection = new Connection('devnet');
  const wallet = new NodeWallet(FEE_PAYER);

  console.log(FEE_PAYER.publicKey.toString());

  describe('success', () => {
    test('generates vault', async () => {
      const externalPriceAccountData = await createExternalPriceAccount({ connection, wallet });

      await pause(20000);

      const vaultResponse = await createVault({
        connection,
        wallet,
        ...externalPriceAccountData,
      });

      await pause(20000);
      const vault = await Vault.load(connection, vaultResponse.vault);
      expect(vault).toHaveProperty('data');
      expect(vault.data.state).toEqual(VaultState.Inactive);
    }, 50000);
  });
});

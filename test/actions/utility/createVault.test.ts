import { Vault, VaultState } from '@metaplex-foundation/mpl-token-vault';

import { pause } from '../../utils';
import { createVault, createExternalPriceAccount } from '../../../src/actions/utility';
import { generateConnectionAndWallet } from '../shared';

describe('creating a Vault', () => {
  describe('success', () => {
    test('generates vault', async () => {
      const { connection, wallet } = await generateConnectionAndWallet();

      const externalPriceAccountData = await createExternalPriceAccount({ connection, wallet });

      const vaultResponse = await createVault({
        connection,
        wallet,
        ...externalPriceAccountData,
      });

      await pause(1000);
      const vault = await Vault.load(connection, vaultResponse.vault);
      expect(vault).toHaveProperty('data');
      expect(vault.data.state).toEqual(VaultState.Inactive);
    });
  });
});

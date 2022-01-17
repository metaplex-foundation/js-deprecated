import { NATIVE_MINT } from '@solana/spl-token';
import { Vault, VaultState } from '@metaplex-foundation/mpl-token-vault';

import { sleep } from '../../utils';
import { generateConnectionAndWallet } from '../shared';
import { closeVault, createVault, createExternalPriceAccount } from '../../../src/actions/utility';

describe('closing a Vault', () => {
  describe('success', () => {
    test('closes vault', async () => {
      const { connection, wallet } = await generateConnectionAndWallet();
      let vault;

      const externalPriceAccountData = await createExternalPriceAccount({ connection, wallet });

      const vaultResponse = await createVault({
        connection,
        wallet,
        ...externalPriceAccountData,
      });

      await sleep(1000);

      vault = await Vault.load(connection, vaultResponse.vault);
      expect(vault).toHaveProperty('data');
      expect(vault.data.state).toEqual(VaultState.Inactive);

      await closeVault({
        connection,
        wallet,
        vault: vaultResponse.vault,
        priceMint: NATIVE_MINT,
      });

      await sleep(1000);

      vault = await Vault.load(connection, vaultResponse.vault);
      expect(vault).toHaveProperty('data');
      expect(vault.data.state).toEqual(VaultState.Combined);
    });
  });
});

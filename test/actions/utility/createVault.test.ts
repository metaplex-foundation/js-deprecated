import { Keypair } from '@solana/web3.js';
import { airdrop, LOCALHOST } from '@metaplex-foundation/amman';
import { Vault, VaultState } from '@metaplex-foundation/mpl-token-vault';

import { pause } from '../../utils';
import { Connection, NodeWallet } from '../../../src';
import { createVault, createExternalPriceAccount } from '../../../src/actions/utility';

describe('creating a Vault', () => {
  describe('success', () => {
    test('generates vault', async () => {
      const payer = Keypair.generate();
      const connection = new Connection(LOCALHOST, 'confirmed');
      await airdrop(connection, payer.publicKey, 10);
      const wallet = new NodeWallet(payer);

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

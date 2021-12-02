import { NATIVE_MINT } from '@solana/spl-token';
import { Connection, NodeWallet } from '../../src';
import { createVault, closeVault } from '../../src/actions';
import { FEE_PAYER, pause, VAULT_EXTENRNAL_PRICE_ACCOUNT } from '../utils';
import { Vault, VaultState } from '../../src/programs/vault';

describe('closing a Vault', () => {
  const connection = new Connection('devnet');
  const wallet = new NodeWallet(FEE_PAYER);

  // console.log(FEE_PAYER.publicKey.toString());
  jest.setTimeout(60000);

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
      expect(vault.data.state).toEqual(VaultState.Active);

      await closeVault({
        connection,
        wallet,
        ...vaultResponse,
        priceMint: NATIVE_MINT,
        externalPriceAccount: VAULT_EXTENRNAL_PRICE_ACCOUNT,
      });

      await pause(20000);

      vault = await Vault.load(connection, vaultResponse.vault);
      expect(vault).toHaveProperty('data');
      expect(vault.data.state).toEqual(VaultState.Combined);
    });
  });
});

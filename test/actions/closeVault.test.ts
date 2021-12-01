import { NATIVE_MINT } from '@solana/spl-token';
import { Connection, NodeWallet } from '../../src';
import { createVault, closeVault } from '../../src/actions';
import { FEE_PAYER, pause, VAULT_EXTENRNAL_PRICE_ACCOUNT } from '../utils';
import { mockAxios200 } from './shared';
import { Vault } from '../../src/programs/vault';

jest.mock('axios');

describe('closing a Vault', () => {
  const connection = new Connection('devnet');
  const wallet = new NodeWallet(FEE_PAYER);

  // console.log(FEE_PAYER.publicKey.toString());
  jest.setTimeout(60000);

  describe('success', () => {
    beforeEach(() => {
      mockAxios200(wallet);
    });

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
      expect(vault.data.state).toEqual(0);

      closeVault({
        connection,
        wallet,
        ...vaultResponse,
        priceMint: NATIVE_MINT,
        externalPriceAccount: VAULT_EXTENRNAL_PRICE_ACCOUNT,
      });

      await pause(20000);

      vault = await Vault.load(connection, vaultResponse.vault);
      expect(vault).toHaveProperty('data');
      expect(vault.data.state).toEqual(2);
    });
  });
});

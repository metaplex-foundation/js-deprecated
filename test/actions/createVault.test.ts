import { NATIVE_MINT } from '@solana/spl-token';
import { Connection, NodeWallet } from '../../src';
import { createVault } from '../../src/actions';
import { FEE_PAYER, pause, VAULT_EXTENRNAL_PRICE_ACCOUNT } from '../utils';
import { mockAxios200 } from './shared';
import { Vault } from '../../src/programs/vault';

jest.mock('axios');

describe('creating a Vault', () => {
  const connection = new Connection('devnet');
  const wallet = new NodeWallet(FEE_PAYER);

  jest.setTimeout(30000);

  describe('success', () => {
    beforeEach(() => {
      mockAxios200(wallet);
    });

    test('generates vault', async () => {
      const vaultResponse = await createVault({
        connection,
        wallet,
        priceMint: NATIVE_MINT,
        externalPriceAccount: VAULT_EXTENRNAL_PRICE_ACCOUNT,
      });

      await pause(20000);

      expect(await Vault.load(connection, vaultResponse.vault)).toHaveProperty('data');
    });
  });
});

import { Keypair } from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';
import { Connection, NodeWallet } from '../../src';
import { createVault } from '../../src/actions';
import { EXTERNAL_PRICE_ACCOUNT_PUBKEY, FEE_PAYER } from '../utils';
import { mockAxios200 } from './shared';
import { Vault } from '../../src/programs/vault';

jest.mock('axios');

describe('creating a Vault', () => {
  const connection = new Connection('devnet');
  const wallet = new NodeWallet(FEE_PAYER);
  const mockTxId = '64Tpr1DNj9UWg1P89Zss5Y4Mh2gGyRUMYZPNenZKY2hiNjsotrCDMBriDrsvhg5BJt3mY4hH6jcparNHCZGhAwf6';
  let universalKey: Keypair;

  // beforeEach(() => {
  //   universalKey = Keypair.generate();
  //   jest.spyOn(Keypair, 'generate').mockReturnValue(universalKey);
  // });

  describe('success', () => {
    beforeEach(() => {
      mockAxios200(wallet);
    });

    test('generates vault', async () => {
      const vaultResponse = await createVault({
        connection,
        wallet,
        priceMint: NATIVE_MINT,
        externalPriceAccount: EXTERNAL_PRICE_ACCOUNT_PUBKEY,
      });

      expect(vaultResponse).toMatchObject({
        txId: mockTxId,
        vault: universalKey.publicKey,
        fractionalMint: universalKey.publicKey,
        redeemTreasury: universalKey.publicKey,
        fractionTreasury: universalKey.publicKey,
      });
      
      expect(await Vault.load(connection, vaultResponse.vault)).not.toThrowError();
    });
  });
});

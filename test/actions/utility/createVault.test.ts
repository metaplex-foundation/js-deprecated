import { Keypair } from '@solana/web3.js';
import { airdrop, LOCALHOST } from '@metaplex-foundation/amman';

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

      const { vault } = await createVault({
        connection,
        wallet,
        ...externalPriceAccountData,
      });

      expect(Boolean(vault)).not.toBeFalsy();
    });
  });
});

import { LOCALHOST } from '@metaplex-foundation/amman';
import { Connection, NodeWallet } from '../../src';
import { createExternalPriceAccount } from '../../src/actions';
import { airdrop } from '@metaplex-foundation/amman';
import { Keypair } from '@solana/web3.js';

describe('creating an external price account', () => {
  describe('success', () => {
    test('creates EPA', async () => {
      const payer = Keypair.generate();
      const connection = new Connection(LOCALHOST, 'confirmed');
      await airdrop(connection, payer.publicKey, 10);
      const wallet = new NodeWallet(payer);

      const externalPriceAccount = await createExternalPriceAccount({
        connection,
        wallet,
      });

      expect(externalPriceAccount).toHaveProperty('externalPriceAccount');
      expect(externalPriceAccount).toHaveProperty('priceMint');
    });
  });
});

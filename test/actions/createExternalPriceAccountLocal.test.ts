import { getUserKeyPairFromFile, LOCAL_NETWORK, testCreatorKeypairPath } from '../utils';
import { Connection, NodeWallet } from '../../src';
import { createExternalPriceAccount } from '../../src/actions';

describe('creating an external price account', () => {
  describe('success', () => {
    test('creates EPA', async () => {
      const connection = new Connection(LOCAL_NETWORK);
      const payer = getUserKeyPairFromFile(testCreatorKeypairPath);
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

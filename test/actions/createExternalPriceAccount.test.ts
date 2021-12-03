import { Connection, NodeWallet } from '../../src';
import { createExternalPriceAccount } from '../../src/actions';
import { FEE_PAYER } from '../utils';

describe('creating an external price account', () => {
  const connection = new Connection('devnet');
  const wallet = new NodeWallet(FEE_PAYER);

  describe('success', () => {
    test('creates EPA', async () => {
      const externalPriceAccount = await createExternalPriceAccount({
        connection,
        wallet,
      });
      expect(externalPriceAccount).toHaveProperty('externalPriceAccount');
      expect(externalPriceAccount).toHaveProperty('priceMint');
    });
  });
});

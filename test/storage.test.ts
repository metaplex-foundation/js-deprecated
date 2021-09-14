import { File } from '../src/isomorphic';
import { ArweaveStorage, ConversionRatePair, Currency } from '../src';
import * as fs from 'fs';

describe('Storage', () => {
  let artwork: File;

  beforeAll(() => {
    artwork = new File([fs.readFileSync('./test/uploads/metaplex.jpg')], 'metaplex.jpg');
  });

  describe('arweave', () => {
    test('cost', async () => {
      const rates: ConversionRatePair[] = [
        { from: Currency.AR, to: Currency.USD, rate: 55.46 },
        { from: Currency.SOL, to: Currency.USD, rate: 159.8 },
      ];

      const storage = await new ArweaveStorage({
        endpoint: 'https://us-central1-principal-lane-200702.cloudfunctions.net/uploadFile2',
      });

      const lamports = await storage.getAssetCostToStore([artwork], rates[0].rate, rates[1].rate);
      expect(lamports).toEqual(expect.any(Number));
    });
  });
});

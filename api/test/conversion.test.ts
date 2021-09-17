import { Coingecko, Currency } from '../src/providers/conversion';

describe('Conversion', () => {
  let coingecko: Coingecko;

  beforeAll(() => {
    // why not just do a static method? well, even though our current Coingecko implementation
    // for ConversionRateProvider is fully public API. Someone else might want to create a
    // class that has API keys or secrets, and would need instantiation. We don't want to create
    // an inflexible interface/
    coingecko = new Coingecko();
  });

  describe('Coingecko', () => {
    test('getRate single currency', async () => {
      const result = await coingecko.getRate(Currency.AR, Currency.USD);
      expect(result[0].from).toEqual(Currency.AR);
      expect(result[0].to).toEqual(Currency.USD);
      expect(result[0].rate).toEqual(expect.any(Number));
    });

    test('getRate multiple to single currency', async () => {
      const result = await coingecko.getRate([Currency.AR, Currency.SOL], Currency.USD);
      expect(result[0].from).toEqual(Currency.AR);
      expect(result[0].to).toEqual(Currency.USD);
      expect(result[0].rate).toEqual(expect.any(Number));

      expect(result[1].from).toEqual(Currency.SOL);
      expect(result[1].to).toEqual(Currency.USD);
      expect(result[1].rate).toEqual(expect.any(Number));
    });

    test('getRate single to multiple currencies', async () => {
      const result = await coingecko.getRate(Currency.AR, [Currency.USD, Currency.EUR]);
      expect(result[0].from).toEqual(Currency.AR);
      expect(result[0].to).toEqual(Currency.USD);
      expect(result[0].rate).toEqual(expect.any(Number));

      expect(result[1].from).toEqual(Currency.AR);
      expect(result[1].to).toEqual(Currency.EUR);
      expect(result[1].rate).toEqual(expect.any(Number));
    });

    test('getRate multiple to multiple currencies', async () => {
      const result = await coingecko.getRate(
        [Currency.AR, Currency.SOL],
        [Currency.USD, Currency.EUR],
      );

      expect(result[0].from).toEqual(Currency.AR);
      expect(result[0].to).toEqual(Currency.USD);
      expect(result[0].rate).toEqual(expect.any(Number));

      expect(result[1].from).toEqual(Currency.AR);
      expect(result[1].to).toEqual(Currency.EUR);
      expect(result[1].rate).toEqual(expect.any(Number));

      expect(result[2].from).toEqual(Currency.SOL);
      expect(result[2].to).toEqual(Currency.USD);
      expect(result[2].rate).toEqual(expect.any(Number));

      expect(result[3].from).toEqual(Currency.SOL);
      expect(result[3].to).toEqual(Currency.EUR);
      expect(result[3].rate).toEqual(expect.any(Number));
    });
  });
});

import { Coingecko, Currency } from '../src/providers/conversion';
import axios, { AxiosResponse } from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.MockedFunction<typeof axios>;

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
      const mockedResponse: AxiosResponse = {
        data: {
          arweave: {
            usd: 53.44,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockedAxios.mockResolvedValue(mockedResponse);
      const result = await coingecko.getRate(Currency.AR, Currency.USD);
      expect(result[0].from).toEqual(Currency.AR);
      expect(result[0].to).toEqual(Currency.USD);
      expect(result[0].rate).toEqual(53.44);
    });

    test('getRate multiple to single currency', async () => {
      const mockedResponse: AxiosResponse = {
        data: {
          arweave: {
            usd: 53.44,
          },
          solana: {
            usd: 203.81,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockedAxios.mockResolvedValue(mockedResponse);

      const result = await coingecko.getRate([Currency.AR, Currency.SOL], Currency.USD);
      expect(result[0].from).toEqual(Currency.AR);
      expect(result[0].to).toEqual(Currency.USD);
      expect(result[0].rate).toEqual(53.44);

      expect(result[1].from).toEqual(Currency.SOL);
      expect(result[1].to).toEqual(Currency.USD);
      expect(result[1].rate).toEqual(203.81);
    });

    test('getRate single to multiple currencies', async () => {
      const mockedResponse: AxiosResponse = {
        data: {
          arweave: {
            usd: 53.44,
            eur: 46.05,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockedAxios.mockResolvedValue(mockedResponse);

      const result = await coingecko.getRate(Currency.AR, [Currency.USD, Currency.EUR]);
      expect(result[0].from).toEqual(Currency.AR);
      expect(result[0].to).toEqual(Currency.USD);
      expect(result[0].rate).toEqual(53.44);

      expect(result[1].from).toEqual(Currency.AR);
      expect(result[1].to).toEqual(Currency.EUR);
      expect(result[1].rate).toEqual(46.05);
    });

    test('getRate multiple to multiple currencies', async () => {
      const mockedResponse: AxiosResponse = {
        data: {
          arweave: {
            usd: 53.44,
            eur: 46.05,
          },
          solana: {
            usd: 203.81,
            eur: 175.69,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockedAxios.mockResolvedValue(mockedResponse);

      const result = await coingecko.getRate(
        [Currency.AR, Currency.SOL],
        [Currency.USD, Currency.EUR],
      );

      expect(result[0].from).toEqual(Currency.AR);
      expect(result[0].to).toEqual(Currency.USD);
      expect(result[0].rate).toEqual(53.44);

      expect(result[1].from).toEqual(Currency.AR);
      expect(result[1].to).toEqual(Currency.EUR);
      expect(result[1].rate).toEqual(46.05);

      expect(result[2].from).toEqual(Currency.SOL);
      expect(result[2].to).toEqual(Currency.USD);
      expect(result[2].rate).toEqual(203.81);

      expect(result[3].from).toEqual(Currency.SOL);
      expect(result[3].to).toEqual(Currency.EUR);
      expect(result[3].rate).toEqual(175.69);
    });

    test('translateCurrency test transformation', () => {
      expect(Coingecko.translateCurrency(Currency.AR)).toBe('arweave');
      expect(Coingecko.translateCurrency(Currency.SOL)).toBe('solana');
      expect(Coingecko.translateCurrency(Currency.USD)).toBe('usd');
      expect(Coingecko.translateCurrency(Currency.EUR)).toBe('eur');

      expect(() => {
        Coingecko.translateCurrency(null as unknown as Currency);
      }).toThrowError();
    });
  });
});

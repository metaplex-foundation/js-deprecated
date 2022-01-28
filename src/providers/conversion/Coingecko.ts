import { ConversionRateProvider, Currency, ConversionRatePair } from './ConversionRateProvider';
import axios from 'axios';

/**
 * Provides currency rate converstion via CoinGecko API.
 */
export class Coingecko implements ConversionRateProvider {
  /**
   * Translates currency strings from the internal Currency enum to the format that Coingecko requires
   * @param currency
   * @returns The provided currency in a format that Coingecko API recognizes. For instance, {@link Currency.AR} becomes 'arweave'
   */
  static translateCurrency(currency: Currency): string {
    switch (currency) {
      case Currency.AR:
        return 'arweave';
      case Currency.SOL:
        return 'solana';
      case Currency.USD:
        return 'usd';
      case Currency.EUR:
        return 'eur';
      default:
        throw new Error('Invalid currency supplied to Coingecko conversion rate provider');
    }
  }

  /**
   * Provides conversion rates for each `from` currency into all the provided `to` currencies
   * @param from
   * @param to
   */
  async getRate(from: Currency | Currency[], to: Currency | Currency[]) {
    const fromArray = typeof from === 'string' ? [from] : from;
    const toArray = typeof to === 'string' ? [to] : to;
    const fromIds = fromArray.map((currency) => Coingecko.translateCurrency(currency)).join(',');
    const toIds = toArray.map((currency) => Coingecko.translateCurrency(currency)).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromIds}&vs_currencies=${toIds}`;
    const response = await axios(url);
    const data = await response.data;
    return fromArray.reduce<ConversionRatePair[]>((previousPairs, fromCurrency) => {
      return [
        ...previousPairs,
        ...toArray.map((toCurrency) => ({
          from: fromCurrency,
          to: toCurrency,
          rate: data[Coingecko.translateCurrency(fromCurrency)][
            Coingecko.translateCurrency(toCurrency)
          ],
        })),
      ];
    }, []);
  }
}

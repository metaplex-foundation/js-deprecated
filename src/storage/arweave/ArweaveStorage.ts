import { Storage } from '../Storage';
import { ConversionRateProvider, Currency } from '../../providers/conversion';

const ARWEAVE_URL = 'https://arweave.net';
const LAMPORT_MULTIPLIER = 10 ** 9;
const WINSTON_MULTIPLIER = 10 ** 12;

export class ArweaveStorage implements Storage {
  conversionRateProvider: ConversionRateProvider;

  constructor(conversionRateProvider) {
    this.conversionRateProvider = conversionRateProvider;
  }

  static async getAssetCostToStore(files: File[], arweaveRate: number, solanaRate: number) {
    const totalBytes = files.reduce((sum, f) => (sum += f.size), 0);
    const txnFeeInWinstons = parseInt(await (await fetch(`${ARWEAVE_URL}/price/0`)).text());
    const byteCostInWinstons = parseInt(
      await (await fetch(`${ARWEAVE_URL}/price/${totalBytes.toString()}`)).text(),
    );
    const totalArCost = (txnFeeInWinstons * files.length + byteCostInWinstons) / WINSTON_MULTIPLIER;
    // To figure out how many lamports are required, multiply ar byte cost by this number
    const arMultiplier = arweaveRate / solanaRate;
    // We also always make a manifest file, which, though tiny, needs payment.
    return LAMPORT_MULTIPLIER * totalArCost * arMultiplier * 1.1;
  }
}

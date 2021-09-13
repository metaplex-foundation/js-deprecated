import { Storage } from '../Storage';
import { ConversionRateProvider } from '../../providers/conversion';

const ARWEAVE_URL = 'https://arweave.net';
const LAMPORT_MULTIPLIER = 10 ** 9;
const WINSTON_MULTIPLIER = 10 ** 12;

export class ArweaveStorage implements Storage {
  conversionRateProvider: ConversionRateProvider;

  constructor(conversionRateProvider) {
    this.conversionRateProvider = conversionRateProvider;
  }

  async getAssetCostToStore(files: File[]) {
    const totalBytes = files.reduce((sum, f) => (sum += f.size), 0);
    const txnFeeInWinstons = parseInt(await (await fetch(`${ARWEAVE_URL}/price/0`)).text());
    const byteCostInWinstons = parseInt(
      await (await fetch(`${ARWEAVE_URL}/price/${totalBytes.toString()}`)).text(),
    );
    const totalArCost = (txnFeeInWinstons * files.length + byteCostInWinstons) / WINSTON_MULTIPLIER;

    const usdRate = this.conversionRateProvider.gerRate('ar', 'usd');
    const solRate = this.conversionRateProvider.getSolRateInUsd('sol', 'usd');

    // To figure out how many lamports are required, multiply ar byte cost by this number
    const arMultiplier = usdRate / solRate;
    console.log('Ar mult', arMultiplier);
    // We also always make a manifest file, which, though tiny, needs payment.
    return LAMPORT_MULTIPLIER * totalArCost * arMultiplier * 1.1;
  }
}

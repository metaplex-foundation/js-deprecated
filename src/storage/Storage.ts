import { ConversionRateProvider } from '../providers/conversion';

export interface Storage {
  conversionRateProvider: ConversionRateProvider;
  getAssetCostToStore: (files: File[]) => Promise<number>;
}

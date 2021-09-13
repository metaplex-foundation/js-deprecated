export abstract class Storage {
  static getAssetCostToStore: (
    files: File[],
    arweaveRate: number,
    solanaRate: number,
  ) => Promise<number>;
}

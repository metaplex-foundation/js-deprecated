import { Buffer } from 'buffer';

export interface UploadResult {
  error?: string;
}

export abstract class Storage {
  getAssetCostToStore: (
    files: Map<string, Buffer>,
    arweaveRate: number,
    solanaRate: number,
  ) => Promise<number>;
  upload: (files: Map<string, Buffer>, mintKey: string, txid: string) => Promise<UploadResult>;
}

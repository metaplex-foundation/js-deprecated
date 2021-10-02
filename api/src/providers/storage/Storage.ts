import { File } from 'formdata-node';

export interface UploadResult {
  error?: string;
}

export abstract class Storage {
  getAssetCostToStore: (
    files: Map<string, File>,
    arweaveRate: number,
    solanaRate: number,
  ) => Promise<number>;
  upload: (files: Map<string, File>, mintKey: string, txid: string) => Promise<UploadResult>;
}

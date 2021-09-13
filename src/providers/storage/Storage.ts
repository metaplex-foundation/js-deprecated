// This is heavily based on the arweave endpoint result object but for the lack of other examples
// this will have to do. It's probably a good idea to refactor at some point to be more general.
export interface UploadResult {
  error?: string;
  messages?: Array<{
    filename: string;
    status: 'success' | 'fail';
    transactionId?: string;
    error?: string;
  }>;
}

export abstract class Storage {
  getAssetCostToStore: (files: File[], arweaveRate: number, solanaRate: number) => Promise<number>;
  upload: (files: File[], mintKey: string, txid: string) => Promise<UploadResult>;
}

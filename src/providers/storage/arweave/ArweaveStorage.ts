import fetch from 'cross-fetch';
import { Storage, UploadResult } from '../Storage';
import File from 'fetch-blob/file.js';
import { FormData } from 'formdata-polyfill/esm.min.js';

const ARWEAVE_URL = 'https://arweave.net';
const LAMPORT_MULTIPLIER = 10 ** 9;
const WINSTON_MULTIPLIER = 10 ** 12;

export interface ArweaveStorageCtorFields {
  endpoint: string;
}

export class ArweaveStorage implements Storage {
  readonly endpoint: string;

  constructor({ endpoint }: ArweaveStorageCtorFields) {
    this.endpoint = endpoint;
  }

  async getAssetCostToStore(files: File[], arweaveRate: number, solanaRate: number) {
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

  async upload(files: File[], mintKey: string, txid: string): Promise<UploadResult> {
    const data = new FormData();
    const tags = files.reduce((acc: Record<string, Array<{ name: string; value: string }>>, f) => {
      acc[f.name] = [{ name: 'mint', value: mintKey }];
      return acc;
    }, {});
    data.append('tags', JSON.stringify(tags));
    data.append('transaction', txid);
    files.map((f) => data.append('file[]', f));
    const response = await fetch(this.endpoint, {
      method: 'POST',
      body: data,
    });
    return response.json();
  }
}

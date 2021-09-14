// let me tell you a little story anon, sit down, get comfortable, grab a cup of tea. Once upon a
// time, a developer just wanted to use fetch API isomorphically, not pollute the global namespace
// (since this is a library), have a nice polyfill for FormData, and upload files. Easy peasy thing
// to expect in 2021, right?.. WRONG!
// Enter dependency hell. `cross-fetch` is the perfect library for isomorphic use of fetch and it
// has a ponyfill (ESM non polluting import), but it's not yet updated to latest `node-fetch`:
// https://github.com/lquixada/cross-fetch/issues/115
// The version of `node-fetch` that `cross-fetch` references is a 2.x that doesn't work with the
// good, standards compliant polyfill, and instead wants to use the `form-data` package, which is
// deprecated in 3.x and doesn't work at all in any permutation (and isn't isomorphic). Long story
// short, either that issue will be addressed quickly or we should just fork it and update it
// ourselves, and submit a PR.
//
// TODO: Make this isomorphic
import fetch from 'node-fetch';
import { Storage, UploadResult } from '../Storage';
import File from 'fetch-blob/file.js';
import { FormData, formDataToBlob } from 'formdata-polyfill/esm.min.js';

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

    data.set('tags', JSON.stringify(tags));
    data.set('transaction', txid);
    files.map((f) => data.append('file[]', f));

    const response = await fetch(this.endpoint, {
      method: 'POST',
      body: formDataToBlob(data),
    });

    return response.json();
  }
}

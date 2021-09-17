import { Storage, UploadResult } from '../Storage';
import axios from 'axios';
import { Buffer } from 'buffer';

const ARWEAVE_URL = 'https://arweave.net';
const LAMPORT_MULTIPLIER = 10 ** 9;
const WINSTON_MULTIPLIER = 10 ** 12;

export interface ArweaveStorageCtorFields {
  endpoint: string;
  env: 'mainnet-beta' | 'testnet' | 'devnet';
}

export class ArweaveStorage implements Storage {
  readonly endpoint: string;
  readonly env: string;

  constructor({ endpoint, env }: ArweaveStorageCtorFields) {
    this.endpoint = endpoint;
    this.env = env;
  }

  async getAssetCostToStore(files: Map<string, Buffer>, arweaveRate: number, solanaRate: number) {
    const buffers = Array.from(files.values());
    const totalBytes = buffers.reduce((sum, f) => (sum += f.byteLength), 0);
    const txnFeeInWinstons = parseInt(await (await axios(`${ARWEAVE_URL}/price/0`)).data);
    const byteCostInWinstons = parseInt(
      await (
        await axios(`${ARWEAVE_URL}/price/${totalBytes.toString()}`)
      ).data,
    );
    const totalArCost =
      (txnFeeInWinstons * buffers.length + byteCostInWinstons) / WINSTON_MULTIPLIER;
    // To figure out how many lamports are required, multiply ar byte cost by this number
    const arMultiplier = arweaveRate / solanaRate;
    // We also always make a manifest file, which, though tiny, needs payment.
    return LAMPORT_MULTIPLIER * totalArCost * arMultiplier * 1.1;
  }

  async upload(files: Map<string, Buffer>, mintKey: string, txid: string): Promise<UploadResult> {
    const fileEntries = Array.from(files.entries());
    const tags = fileEntries.reduce(
      (acc: Record<string, Array<{ name: string; value: string }>>, f) => {
        acc[f[0]] = [{ name: 'mint', value: mintKey }];
        return acc;
      },
      {},
    );

    return {};

    // data.append('tags', JSON.stringify(tags));
    // data.append('transaction', txid);
    // data.append('env', this.env);
    // files.map((f) => {
    //   data.append('file[]', f);
    // });

    // const response = await fetch(this.endpoint, {
    //   method: 'POST',
    //   // TODO: I hate to do this, but it seems to be like an upstream problem:
    //   // https://github.com/jimmywarting/FormData/issues/133
    //   // I'll make sure to track it. - Danny
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   body: data,
    // });

    // return response.json();
  }
}

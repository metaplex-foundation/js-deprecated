import { Buffer } from 'buffer';
import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';

import { ArweaveStorage, ArweaveUploadResult, ConversionRatePair, Currency } from '../src';
import { NETWORK } from './utils';

const UPLOAD_ENDPOINT = 'https://us-central1-principal-lane-200702.cloudfunctions.net/uploadFile4';
const ENV = NETWORK;

const EXAMPLE_SUCCESSFUL_RESPONSE: ArweaveUploadResult = {
  messages: [
    {
      filename: 'metaplex.jpg',
      status: 'success',
      transactionId: 'yX4klt1AjkEwSAIA5c123w7C1lyr-asdNZz8VfYmQhI',
    },
  ],
};

const EXAMPLE_FAILED_RESPONSE: ArweaveUploadResult = {
  messages: [
    {
      filename: 'metaplex.jpg',
      status: 'fail',
      error: 'Failed',
    },
  ],
  error: 'Failed',
};

describe('Storage', () => {
  let files: Map<string, Buffer>;

  beforeAll(() => {
    files = new Map([['metaplex.jpg', fs.readFileSync('./test/uploads/metaplex.jpg')]]);
  });

  describe('arweave', () => {
    test('getAssetCostToStore', async () => {
      const rates: ConversionRatePair[] = [
        { from: Currency.AR, to: Currency.USD, rate: 55.46 },
        { from: Currency.SOL, to: Currency.USD, rate: 159.8 },
      ];

      const storage = await new ArweaveStorage({
        endpoint: UPLOAD_ENDPOINT,
        env: ENV,
      });

      const lamports = await storage.getAssetCostToStore(files, rates[0].rate, rates[1].rate);
      expect(lamports).toEqual(expect.any(Number));
    });

    describe('upload', () => {
      test('successful', async () => {
        const storage = await new ArweaveStorage({
          endpoint: UPLOAD_ENDPOINT,
          env: ENV,
        });

        axios.post = jest.fn().mockResolvedValue({ data: EXAMPLE_SUCCESSFUL_RESPONSE });

        const result = await storage.upload(files, 'mintKey', 'txId');
        expect(axios.post).toBeCalledWith(UPLOAD_ENDPOINT, expect.any(FormData));

        expect(result).toEqual(EXAMPLE_SUCCESSFUL_RESPONSE);
      });

      test('failed', async () => {
        const storage = await new ArweaveStorage({
          endpoint: UPLOAD_ENDPOINT,
          env: ENV,
        });

        axios.post = jest.fn().mockResolvedValue({ data: EXAMPLE_FAILED_RESPONSE });

        await expect(storage.upload(files, 'mintKey', 'txId')).rejects.toEqual(
          new Error(EXAMPLE_FAILED_RESPONSE.error),
        );
      });
    });
  });
});

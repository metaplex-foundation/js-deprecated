import { Keypair } from '@solana/web3.js';
import axios, { AxiosResponse } from 'axios';
import { airdrop, LOCALHOST } from '@metaplex-foundation/amman';

import { Connection, NodeWallet, Wallet } from '../../../src';

export const uri =
  'https://bafkreibj4hjlhf3ehpugvfy6bzhhu2c7frvyhrykjqmoocsvdw24omfqga.ipfs.dweb.link';

export const mockAxios200 = (wallet: Wallet, secondSigner: Keypair | undefined = undefined) => {
  const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios>;
  const mockedResponse: AxiosResponse = {
    data: {
      name: 'Holo Design (0)',
      symbol: '',
      description:
        'A holo of some design in a lovely purple, pink, and yellow. Pulled from the Internet. Demo only.',
      seller_fee_basis_points: 100,
      image: uri,
      external_url: '',
      properties: {
        creators: [
          {
            address: wallet.publicKey.toString(),
            verified: 1,
            share: 100,
          },
        ],
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  };
  if (secondSigner) {
    mockedResponse.data.properties.creators.push({
      address: secondSigner.publicKey.toString(),
      verified: 0,
      share: 0,
    });
  }
  mockedAxiosGet.mockResolvedValue(mockedResponse);
};

export const mockAxios404 = () => {
  const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios>;
  const mockedResponse: AxiosResponse = {
    data: {},
    status: 404,
    statusText: 'NOT FOUND',
    headers: {},
    config: {},
  };
  mockedAxiosGet.mockRejectedValue(mockedResponse);
};

export const generateConnectionAndWallet = async () => {
  const payer = Keypair.generate();
  const connection = new Connection(LOCALHOST, 'confirmed');
  await airdrop(connection, payer.publicKey, 10);
  const wallet = new NodeWallet(payer);

  return { connection, wallet, payer };
};

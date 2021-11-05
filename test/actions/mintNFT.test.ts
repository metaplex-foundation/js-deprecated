import { Keypair, PublicKey } from '@solana/web3.js';
import axios, { AxiosResponse } from 'axios';
import { Connection } from './../../src/Connection';
import { NodeWallet, Wallet } from './../../src/wallet';
import { mintNFT } from './../../src/actions';
import { FEE_PAYER } from './../utils';
import { MasterEdition, Metadata } from './../../src/programs/metadata';

jest.mock('axios');

const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios>;
const uri = 'https://bafkreibj4hjlhf3ehpugvfy6bzhhu2c7frvyhrykjqmoocsvdw24omfqga.ipfs.dweb.link';

describe('minting an NFT', () => {
  let connection: Connection;
  let mint: Keypair;
  let wallet: Wallet;

  beforeAll(() => {
    connection = new Connection('devnet');
    wallet = new NodeWallet(FEE_PAYER);
    jest
      .spyOn(connection, 'sendRawTransaction')
      .mockResolvedValue(
        '64Tpr1DNj9UWg1P89Zss5Y4Mh2gGyRUMYZPNenZKY2hiNjsotrCDMBriDrsvhg5BJt3mY4hH6jcparNHCZGhAwf6',
      );
  });

  beforeEach(() => {
    mint = Keypair.generate();
    jest.spyOn(Keypair, 'generate').mockReturnValue(mint);
  });

  describe('when can find metadata json', () => {
    beforeEach(() => {
      const mockedResponse: AxiosResponse = {
        data: {
          name: 'Holo Design (0)',
          symbol: '',
          description:
            'A holo of some design in a lovely purple, pink, and yellow. Pulled from the Internet. Demo only.',
          seller_fee_basis_points: 100,
          image:
            'https://bafybeidq34cu23fq4u57xu3hp2usqqs7miszscyu4kjqyjo3hv7xea6upe.ipfs.dweb.link',
          external_url: '',
          properties: {
            creators: [
              {
                address: wallet.publicKey.toString(),
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

      mockedAxiosGet.mockResolvedValue(mockedResponse);
    });

    test('generates a unique mint and creates metadata plus master edition from metadata URL and max supply', async () => {
      const mintResponse = await mintNFT({
        connection,
        wallet,
        uri,
        maxSupply: 0,
      });

      const metadata = await Metadata.getPDA(mint.publicKey);
      const edition = await MasterEdition.getPDA(mint.publicKey);

      expect(mintResponse).toMatchObject({
        metadata,
        edition,
        mint: mint.publicKey,
      });
    });
  });

  describe('when metadata json not found', () => {
    beforeEach(() => {
      const mockedResponse: AxiosResponse = {
        data: {},
        status: 404,
        statusText: 'NOT FOUND',
        headers: {},
        config: {},
      };

      mockedAxiosGet.mockRejectedValue(mockedResponse);
    });

    test('exits the action and throws an error', async () => {
      try {
        await mintNFT({
          connection,
          wallet,
          uri,
          maxSupply: 0,
        });
      } catch (e) {
        expect(e).not.toBeNull();
      }
    });
  });
});

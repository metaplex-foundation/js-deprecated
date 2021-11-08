import { Keypair } from '@solana/web3.js';
import axios, { AxiosResponse } from 'axios';
import { Connection, NodeWallet, Wallet } from '../../src';
import { mintNFT } from '../../src/actions';
import { FEE_PAYER, pause } from '../utils';
import { MasterEdition, Metadata } from '../../src/programs/metadata';
import { mintEditionFromMaser } from '../../src/actions/mintEditionFromMaster';

jest.mock('axios');
jest.setTimeout(100000);

const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios>;
const uri = 'https://bafkreibj4hjlhf3ehpugvfy6bzhhu2c7frvyhrykjqmoocsvdw24omfqga.ipfs.dweb.link';

describe('minting a limited edition from master', () => {
  let connection: Connection;
  let mint: Keypair;
  let wallet: Wallet;

  beforeAll(() => {
    connection = new Connection('devnet');
    wallet = new NodeWallet(FEE_PAYER);
  });

  beforeEach(() => {
    mint = Keypair.generate();
    const mockedResponse: AxiosResponse = {
      data: {
        name: 'Holo Design (0)',
        symbol: '',
        description:
          'A holo of some design in a lovely purple, pink, and yellow. Pulled from the Internet. Demo only.',
        seller_fee_basis_points: 100,
        image: 'https://bafybeidq34cu23fq4u57xu3hp2usqqs7miszscyu4kjqyjo3hv7xea6upe.ipfs.dweb.link',
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

  test('mints successfully', async () => {
    const masterMintResponse = await mintNFT({
      connection,
      wallet,
      uri,
      maxSupply: 100,
    });

    // unfortunately it takes some time for the master mint to propagate
    // empirically, I found anything below 20s to be unreliable
    await pause(20000);

    const editionMintResponse = await mintEditionFromMaser({
      connection,
      wallet,
      masterEditionMint: masterMintResponse.mint,
    });

    // the below is nice, but the real test is that the transaction went through w/o errors
    const newEditionMint = editionMintResponse.mint;
    const metadata = await Metadata.getPDA(newEditionMint);
    const edition = await MasterEdition.getPDA(newEditionMint);
    expect(editionMintResponse.edition).toEqual(edition);
    expect(editionMintResponse.metadata).toEqual(metadata);
  });
});

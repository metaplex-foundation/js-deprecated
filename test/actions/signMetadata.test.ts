import { Keypair } from '@solana/web3.js';
import axios, { AxiosResponse } from 'axios';
import { Account, Connection, NodeWallet, Wallet } from '../../src';
import { mintNFT } from '../../src/actions';
import { FEE_PAYER, pause } from '../utils';
import { Metadata } from '../../src/programs/metadata';
import { signMetadata } from '../../src/actions/signMetadata';

jest.mock('axios');
jest.setTimeout(100000);

const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios>;
const uri = 'https://bafkreibj4hjlhf3ehpugvfy6bzhhu2c7frvyhrykjqmoocsvdw24omfqga.ipfs.dweb.link';

describe('signing metadata on a master edition', () => {
  let connection: Connection;
  let mint: Keypair;
  let secondSigner: Keypair;
  let wallet: Wallet;

  beforeAll(() => {
    connection = new Connection('devnet');
    wallet = new NodeWallet(FEE_PAYER);
  });

  beforeEach(() => {
    mint = Keypair.generate();
    secondSigner = Keypair.generate();
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
              verified: 1,
              share: 50,
            },
            {
              address: secondSigner.publicKey.toString(),
              verified: 0,
              share: 50,
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

  test('signs successfully', async () => {
    const masterMintResponse = await mintNFT({
      connection,
      wallet,
      uri,
      maxSupply: 100,
    });

    // unfortunately it takes some time for the master mint to propagate
    // empirically, I found anything below 20s to be unreliable
    await pause(20000);

    // before update
    const metadata = await Metadata.getPDA(masterMintResponse.mint);
    let info = await Account.getInfo(connection, metadata);
    let metadataData = new Metadata(metadata, info).data;
    expect(metadataData.data.creators[1].verified).toEqual(0);

    await signMetadata({
      connection,
      wallet,
      editionMint: masterMintResponse.mint,
      signer: secondSigner,
    });

    await pause(20000);

    //after update
    info = await Account.getInfo(connection, metadata);
    metadataData = new Metadata(metadata, info).data;
    expect(metadataData.data.creators[1].verified).toEqual(1);
  });
});

import { Keypair } from '@solana/web3.js';
import axios, { AxiosResponse } from 'axios';
import { Account, Connection, NodeWallet, Wallet } from '../../src';
import { mintNFT } from '../../src/actions';
import { FEE_PAYER, pause } from '../utils';
import { Creator, Metadata, MetadataDataData } from '../../src/programs/metadata';
import { updateMetadata } from '../../src/actions/updateMetadata';

jest.mock('axios');
jest.setTimeout(100000);

const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios>;
const uri = 'https://bafkreibj4hjlhf3ehpugvfy6bzhhu2c7frvyhrykjqmoocsvdw24omfqga.ipfs.dweb.link';

describe('updating metadata on a master edition', () => {
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

  test('updates successfully', async () => {
    const newAuthority = Keypair.generate();

    const newMetadataData = new MetadataDataData({
      name: 'xyzname',
      symbol: 'xyz',
      uri: 'https://gateway.pinata.cloud/ipfs/QmNQh8noRHn7e7zt9oYNfGWuxHgKWkNPducMZs1SiZaYw4',
      sellerFeeBasisPoints: 10,
      creators: [
        new Creator({
          address: Keypair.generate().publicKey.toBase58(),
          verified: false,
          share: 100,
        }),
      ],
    });

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
    expect(metadataData.data.name).toEqual('Holo Design (0)');
    expect(metadataData.updateAuthority).toEqual(wallet.publicKey.toBase58());
    expect(metadataData.primarySaleHappened).toEqual(0);

    await updateMetadata({
      connection,
      wallet,
      editionMint: masterMintResponse.mint,
      newMetadataData,
      newUpdateAuthority: newAuthority.publicKey,
      primarySaleHappened: true,
    });

    await pause(20000);

    //after update
    info = await Account.getInfo(connection, metadata);
    metadataData = new Metadata(metadata, info).data;
    expect(metadataData.data.name).toEqual('xyzname');
    expect(metadataData.updateAuthority).toEqual(newAuthority.publicKey.toBase58());
    expect(metadataData.primarySaleHappened).toEqual(1);
  });
});

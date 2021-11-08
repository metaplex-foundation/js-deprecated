import { Keypair } from '@solana/web3.js';
import axios, { AxiosResponse } from 'axios';
import { Account, Connection, NodeWallet, Wallet } from '../../src';
import { FEE_PAYER, pause } from '../utils';
import { Creator, MasterEdition, Metadata, MetadataDataData } from '../../src/programs/metadata';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createMetadata } from '../../src/actions/createMetadata';
import { createMasterEdition } from '../../src/actions/createMasterEdition';
import BN from 'bn.js';

jest.mock('axios');
jest.setTimeout(150000); //this one takes particularly long

const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios>;
const uri = 'https://bafkreibj4hjlhf3ehpugvfy6bzhhu2c7frvyhrykjqmoocsvdw24omfqga.ipfs.dweb.link';

// NOTE: testing the two together because latter effectively requires former
describe('creatomg metadata and master edition PDAs', () => {
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

  test('creates both successfully', async () => {
    const mint = await Token.createMint(
      connection,
      FEE_PAYER,
      wallet.publicKey,
      wallet.publicKey,
      0,
      TOKEN_PROGRAM_ID,
    );
    const tokenAddress = await mint.createAssociatedTokenAccount(wallet.publicKey);
    await mint.mintTo(tokenAddress, wallet.publicKey, [], 1);

    const metadataData = new MetadataDataData({
      name: 'xyzname',
      symbol: 'xyz',
      uri,
      sellerFeeBasisPoints: 10,
      creators: [
        new Creator({
          address: wallet.publicKey.toBase58(),
          verified: false,
          share: 100,
        }),
      ],
    });

    await createMetadata({
      connection,
      wallet,
      editionMint: mint.publicKey,
      metadataData,
    });

    await pause(20000);

    const metadata = await Metadata.getPDA(mint.publicKey);
    const metadataInfo = await Account.getInfo(connection, metadata);
    const deserializedMetadataData = new Metadata(metadata, metadataInfo).data;
    expect(deserializedMetadataData.data.name).toEqual('xyzname');

    await createMasterEdition({
      connection,
      wallet,
      editionMint: mint.publicKey,
      maxSupply: new BN(100),
    });

    // had to increase to 25s, or it was failing
    await pause(25000);

    const edition = await MasterEdition.getPDA(mint.publicKey);
    const editionInfo = await Account.getInfo(connection, edition);
    const deserializedEditionData = new MasterEdition(edition, editionInfo).data;
    expect(deserializedEditionData.maxSupply.toString(10)).toEqual('100');
  });
});

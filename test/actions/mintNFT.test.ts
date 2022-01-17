import { Keypair } from '@solana/web3.js';
import { Connection, NodeWallet } from '../../src';
import { mintNFT, MintNFTParams } from '../../src/actions';
import { sleep } from '../utils';
import { MasterEdition, Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { uri, generateConnectionAndWallet, mockAxios200, mockAxios404 } from './shared';
import { airdrop } from '@metaplex-foundation/amman';

jest.mock('axios');

describe('minting an NFT', () => {
  let connection: Connection;
  let wallet: NodeWallet;
  let payer: Keypair;

  beforeAll(async () => {
    const result = await generateConnectionAndWallet();
    connection = result.connection;
    wallet = result.wallet;
    payer = result.payer;

    await airdrop(connection, payer.publicKey, 2);
  });

  describe('when metadata json is found', () => {
    beforeAll(async () => {
      mockAxios200(wallet); // metadata json found
    });

    const values = [0, 3, undefined];
    for (const maxSupply of values) {
      describe(`when max supply is "${maxSupply}"`, () => {
        test('generates a unique mint, metadata & master editions from metadata URL', async () => {
          const arg: MintNFTParams = {
            connection,
            wallet,
            uri,
          };

          if (maxSupply !== undefined) {
            arg.maxSupply = maxSupply;
          }

          const mintResponse = await mintNFT(arg);
          const { mint } = mintResponse;

          const metadata = await Metadata.getPDA(mint);
          const edition = await MasterEdition.getPDA(mint);

          expect(mintResponse).toMatchObject({
            metadata,
            edition,
          });

          await sleep(2000); // HACK

          const metadataEdition = (await Metadata.getEdition(connection, mint)) as MasterEdition;
          expect(metadataEdition.data?.maxSupply?.toNumber()).toBe(maxSupply);
        });
      });
    }
  });

  describe('when metadata json not found', () => {
    beforeEach(() => {
      mockAxios404();

      jest
        .spyOn(connection, 'sendRawTransaction')
        .mockResolvedValue(
          '64Tpr1DNj9UWg1P89Zss5Y4Mh2gGyRUMYZPNenZKY2hiNjsotrCDMBriDrsvhg5BJt3mY4hH6jcparNHCZGhAwf6',
        );
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
        expect(e.message).toMatch(/unable to get metadata/);
      }
    });
  });
});

import { Keypair } from '@solana/web3.js';
import { Connection, NodeWallet } from '../../src';
import { mintNFT } from '../../src/actions';
import { FEE_PAYER, NETWORK } from '../utils';
import { MasterEdition, Metadata } from '../../src/programs/metadata';
import { mockAxios200, mockAxios404, uri } from './shared';

jest.mock('axios');

describe('minting an NFT', () => {
  const connection = new Connection(NETWORK);
  const wallet = new NodeWallet(FEE_PAYER);
  let mint: Keypair;

  beforeAll(() => {
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
      mockAxios200(wallet);
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
      mockAxios404();
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

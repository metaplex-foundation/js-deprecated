import { Keypair } from '@solana/web3.js';
import { Connection, NodeWallet } from '../../src';
import { mintNFT } from '../../src/actions';
import { FEE_PAYER, NETWORK, pause } from '../utils';
import { MasterEdition, Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { mintEditionFromMaster } from '../../src/actions/mintEditionFromMaster';
import { mockAxios200, uri } from './shared';

jest.mock('axios');
jest.setTimeout(100000);

describe('minting a limited edition from master', () => {
  const connection = new Connection(NETWORK);
  const wallet = new NodeWallet(FEE_PAYER);
  let mint: Keypair;

  beforeEach(() => {
    mint = Keypair.generate();
    mockAxios200(wallet);
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

    const editionMintResponse = await mintEditionFromMaster({
      connection,
      wallet,
      masterEditionMint: masterMintResponse.mint,
    });

    const newEditionMint = editionMintResponse.mint;
    const metadata = await Metadata.getPDA(newEditionMint);
    const edition = await MasterEdition.getPDA(newEditionMint);
    expect(editionMintResponse.edition).toEqual(edition);
    expect(editionMintResponse.metadata).toEqual(metadata);
  });
});

import { Keypair } from '@solana/web3.js';
import { Connection, NodeWallet } from '../../src';
import { mintNFT } from '../../src/actions';
import { FEE_PAYER, NETWORK, sleep } from '../utils';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { signMetadata } from '../../src/actions/signMetadata';
import { mockAxios200, uri } from './shared';
import { Account } from '@metaplex-foundation/mpl-core';

jest.mock('axios');
jest.setTimeout(100000);

describe('signing metadata on a master edition', () => {
  const connection = new Connection(NETWORK);
  const wallet = new NodeWallet(FEE_PAYER);
  let secondSigner: Keypair;

  beforeEach(() => {
    secondSigner = Keypair.generate();
    mockAxios200(wallet, secondSigner);
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
    await sleep(20000);

    // before signing
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

    await sleep(20000);

    //after signing
    info = await Account.getInfo(connection, metadata);
    metadataData = new Metadata(metadata, info).data;
    expect(metadataData.data.creators[1].verified).toEqual(1);
  });
});

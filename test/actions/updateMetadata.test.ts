import { Keypair } from '@solana/web3.js';
import { Connection, NodeWallet } from '../../src';
import { mintNFT } from '../../src/actions';
import { FEE_PAYER, NETWORK, sleep } from '../utils';
import { Creator, Metadata, MetadataDataData } from '@metaplex-foundation/mpl-token-metadata';
import { updateMetadata } from '../../src/actions/updateMetadata';
import { mockAxios200, uri } from './shared';
import { Account } from '@metaplex-foundation/mpl-core';

jest.mock('axios');
jest.setTimeout(100000);

describe('updating metadata on a master edition', () => {
  const connection = new Connection(NETWORK);
  const wallet = new NodeWallet(FEE_PAYER);

  beforeEach(() => {
    mockAxios200(wallet);
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
    await sleep(20000);

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

    await sleep(20000);

    //after update
    info = await Account.getInfo(connection, metadata);
    metadataData = new Metadata(metadata, info).data;
    expect(metadataData.data.name).toEqual('xyzname');
    expect(metadataData.updateAuthority).toEqual(newAuthority.publicKey.toBase58());
    expect(metadataData.primarySaleHappened).toEqual(1);
  });
});

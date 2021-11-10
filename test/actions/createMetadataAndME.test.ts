import { Keypair } from '@solana/web3.js';
import { Account, Connection, NodeWallet } from '../../src';
import { FEE_PAYER, pause } from '../utils';
import { Creator, MasterEdition, Metadata, MetadataDataData } from '../../src/programs/metadata';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createMetadata } from '../../src/actions/createMetadata';
import { createMasterEdition } from '../../src/actions/createMasterEdition';
import BN from 'bn.js';
import { uri } from './shared';

jest.setTimeout(150000); //this one takes particularly long

// NOTE: testing the two together because latter effectively requires former
describe('creatomg metadata and master edition PDAs', () => {
  const connection = new Connection('devnet');
  const wallet = new NodeWallet(FEE_PAYER);
  let mint: Keypair;

  beforeEach(() => {
    mint = Keypair.generate();
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

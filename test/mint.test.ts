import { jest } from '@jest/globals';
import { File } from '../src/isomorphic';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as fs from 'fs';
import {
  Connection,
  MetadataJson,
  Coingecko,
  Currency,
  Utils,
  ArweaveStorage,
  Transaction,
  PayForFiles,
  CreateMint,
  CreateAssociatedTokenAccount,
} from '../src';

describe('Mint NFT', () => {
  let connection: Connection;
  let creator: Keypair;
  let artwork: File;

  // set 80s timeout because the devnet RPC can be notoriously slow and we don't want tests
  // constantly failing due to timeouts...
  jest.setTimeout(80000);

  beforeAll(async () => {
    connection = new Connection('devnet');
    creator = Keypair.generate();
    // we need to airdrop some SOL on our creator account so we can test transactions
    const signature = await connection.requestAirdrop(creator.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature, 'finalized');
    // a 16x16 metaplex logo blob :)
    artwork = new File([fs.readFileSync('./test/uploads/metaplex.jpg')], 'metaplex.jpg');
  });

  test('mint', async () => {
    // we can get the rates from any other provider that implements the ConversionRateProvider abstract class
    const rates = await new Coingecko().getRate([Currency.AR, Currency.SOL], Currency.USD);
    const storage = await new ArweaveStorage({
      endpoint: 'https://us-central1-principal-lane-200702.cloudfunctions.net/uploadFile4',
      env: 'devnet',
    });
    // this is a bit of undocumented behavior right here. the arweave upload endpoint seems to be taking those
    // relative URLs and converting them to absolute URLs. In the future it might be better to decouple this.
    const metadataContent: MetadataJson = {
      name: 'Magnus Testus',
      symbol: '',
      description: 'An NFT that is minted in the test suite',
      seller_fee_basis_points: 300,
      image: 'metaplex.jpg',
      animation_url: null,
      external_url: null,
      properties: {
        files: [
          {
            uri: 'metaplex.jpg',
            type: 'image/jpeg',
          },
        ],
        category: 'image',
        creators: [
          {
            address: creator.publicKey.toBase58(),
            verified: true,
            share: 100,
          },
        ],
      },
    };
    const files: File[] = [artwork, new File([JSON.stringify(metadataContent)], 'metadata.json')];
    const fileHashes = await Promise.all(files.map((file) => Utils.crypto.getFileHash(file)));
    const lamports = await storage.getAssetCostToStore(files, rates[0].rate, rates[1].rate);

    const payForFilesTx = new PayForFiles(
      {
        feePayer: creator.publicKey,
      },
      {
        lamports,
        fileHashes,
      },
    );

    const newMintAccount = Keypair.generate();
    const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);

    // This owner is a temporary signer and owner of metadata we use to circumvent requesting signing
    // twice post Arweave. We store in an account (payer) and use it post-Arweave to update MD with new link
    // then give control back to the user.
    const createMintTx = new CreateMint(
      {
        feePayer: creator.publicKey,
      },
      {
        newAccountPubkey: newMintAccount.publicKey,
        lamports: mintRent,
      },
    );

    const recipientKey = await PublicKey.findProgramAddress(
      [
        creator.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        newMintAccount.publicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const createAssociatedTokenAccountTx = new CreateAssociatedTokenAccount(
      {
        feePayer: creator.publicKey,
      },
      {
        associatedTokenAddress: recipientKey[0],
        splTokenMintAddress: newMintAccount.publicKey,
      },
    );

    const combinedTransaction = Transaction.fromCombined([
      payForFilesTx,
      createMintTx,
      createAssociatedTokenAccountTx,
    ]);

    const txid = await sendAndConfirmTransaction(
      connection,
      combinedTransaction,
      [creator, newMintAccount],
      {
        commitment: 'confirmed',
      },
    );
    const result = await storage.upload(files, newMintAccount.publicKey.toBase58(), txid);
    console.log('result', result);
    expect(typeof result).toBe('object');
    expect(result.messages).toBeInstanceOf(Array);
    expect(result.messages[0].status).toEqual('success');
    expect(result.messages[0].filename).toEqual('metaplex.jpg');
    expect(result.messages[1].status).toEqual('success');
    expect(result.messages[1].filename).toEqual('metadata.json');
    expect(result.messages[2].status).toEqual('success');
    expect(result.messages[2].filename).toEqual('manifest.json');

    // TODO: Create the Master Edition and change mint owner account
  });
});

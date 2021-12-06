import { jest } from '@jest/globals';
import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import { Connection } from '../../src';

import {
  Metadata,
  MetadataDataData,
  CreateMetadata,
  UpdateMetadata,
  MasterEdition,
  CreateMasterEdition,
} from '@metaplex-foundation/mpl-token-metadata';
import { CreateMint, CreateAssociatedTokenAccount, MintTo } from '../../src/programs/shared';
import { FEE_PAYER, NETWORK } from '../utils';
import { Transaction } from '@metaplex-foundation/mpl-core';

describe.skip('Metaplex transactions', () => {
  let connection: Connection;
  let owner: Keypair;
  let mint: Keypair;

  jest.setTimeout(80000);

  beforeAll(() => {
    connection = new Connection(NETWORK);
    owner = Keypair.generate();
    mint = Keypair.generate();
  });

  test('createMetadata', async () => {
    const metadataPDA = await Metadata.getPDA(mint.publicKey);

    const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
    const createMintTx = new CreateMint(
      { feePayer: FEE_PAYER.publicKey },
      {
        newAccountPubkey: mint.publicKey,
        lamports: mintRent,
      },
    );
    const metadataData = new MetadataDataData({
      name: 'Test',
      symbol: '',
      uri: '',
      sellerFeeBasisPoints: 300,
      creators: null,
    });

    const tx = new CreateMetadata(
      { feePayer: FEE_PAYER.publicKey },
      {
        metadata: metadataPDA,
        metadataData,
        updateAuthority: owner.publicKey,
        mint: mint.publicKey,
        mintAuthority: FEE_PAYER.publicKey,
      },
    );

    const txs = Transaction.fromCombined([createMintTx, tx]);

    await sendAndConfirmTransaction(connection, txs, [FEE_PAYER, mint, owner], {
      commitment: 'confirmed',
    });
  });

  test('updateMetadata', async () => {
    const metadataPDA = await Metadata.getPDA(mint.publicKey);
    const tx = new UpdateMetadata(
      { feePayer: FEE_PAYER.publicKey },
      {
        metadata: metadataPDA,
        updateAuthority: owner.publicKey,
        primarySaleHappened: true,
      },
    );

    await sendAndConfirmTransaction(connection, tx, [FEE_PAYER, owner], {
      commitment: 'confirmed',
    });
  });

  test('createMasterEdition', async () => {
    const metadataPDA = await Metadata.getPDA(mint.publicKey);
    const editionPDA = await MasterEdition.getPDA(mint.publicKey);

    const [recipient] = await PublicKey.findProgramAddress(
      [FEE_PAYER.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const createAssociatedTokenAccountTx = new CreateAssociatedTokenAccount(
      { feePayer: FEE_PAYER.publicKey },
      {
        associatedTokenAddress: recipient,
        splTokenMintAddress: mint.publicKey,
      },
    );

    const mintToTx = new MintTo(
      { feePayer: FEE_PAYER.publicKey },
      {
        mint: mint.publicKey,
        dest: recipient,
        amount: 1,
      },
    );

    const tx = new CreateMasterEdition(
      { feePayer: FEE_PAYER.publicKey },
      {
        edition: editionPDA,
        metadata: metadataPDA,
        updateAuthority: owner.publicKey,
        mint: mint.publicKey,
        mintAuthority: FEE_PAYER.publicKey,
      },
    );

    const txs = Transaction.fromCombined([createAssociatedTokenAccountTx, mintToTx, tx]);

    await sendAndConfirmTransaction(connection, txs, [FEE_PAYER, owner], {
      commitment: 'confirmed',
    });
  });
});

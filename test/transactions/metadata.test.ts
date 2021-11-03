import { jest } from '@jest/globals';
import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { Connection } from '../../src';

import { Metadata, UpdateMetadata } from '../../src/programs/metadata';
import { FEE_PAYER } from '../utils';

describe('Metaplex transactions', () => {
  let connection: Connection;
  let owner: Keypair;
  let mint: Keypair;

  jest.setTimeout(80000);

  beforeAll(() => {
    connection = new Connection('devnet');
    owner = Keypair.generate();
    mint = Keypair.generate();
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

    const response = await sendAndConfirmTransaction(connection, tx, [FEE_PAYER, owner], {
      commitment: 'confirmed',
    });

    console.log('send transaction response', response);
  });
});

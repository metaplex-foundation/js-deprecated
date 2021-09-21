import { jest } from '@jest/globals';
import { MintLayout } from '@solana/spl-token';
import { Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import {
  Connection,
  CreateMetadata,
  CreateMint,
  Metadata,
  MetadataDataData,
  Transaction,
} from '../../src';
import { FEE_PAYER } from '../utils';

describe('Metaplex transactions', () => {
  let connection: Connection;
  let owner: Keypair;

  jest.setTimeout(80000);

  beforeAll(() => {
    connection = new Connection('devnet');
    owner = Keypair.generate();
  });

  test('createMetadata', async () => {
    const mintAccount = Keypair.generate();
    const metadataPDA = await Metadata.getPDA(mintAccount.publicKey);

    const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
    const createMintTx = new CreateMint(
      { feePayer: FEE_PAYER.publicKey },
      {
        newAccountPubkey: mintAccount.publicKey,
        lamports: mintRent,
        owner: owner.publicKey,
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
        mint: mintAccount.publicKey,
        mintAuthority: owner.publicKey,
      },
    );

    const txs = Transaction.fromCombined([createMintTx, tx]);

    await sendAndConfirmTransaction(connection, txs, [FEE_PAYER, mintAccount, owner], {
      commitment: 'confirmed',
    });
  });
});

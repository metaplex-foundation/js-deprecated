import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { CreateAssociatedTokenAccount, CreateMint, MintTo } from '../../programs';

export async function prepareTokenAccountAndMintTx(connection: Connection, owner: PublicKey) {
  const mint = Keypair.generate();
  const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
  const createMintTx = new CreateMint(
    { feePayer: owner },
    {
      newAccountPubkey: mint.publicKey,
      lamports: mintRent,
    },
  );

  const recipient = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint.publicKey,
    owner,
  );

  const createAssociatedTokenAccountTx = new CreateAssociatedTokenAccount(
    { feePayer: owner },
    {
      associatedTokenAddress: recipient,
      splTokenMintAddress: mint.publicKey,
    },
  );

  const mintToTx = new MintTo(
    { feePayer: owner },
    {
      mint: mint.publicKey,
      dest: recipient,
      amount: 1,
    },
  );

  return { mint, createMintTx, createAssociatedTokenAccountTx, mintToTx };
}

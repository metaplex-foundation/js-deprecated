import { MintLayout, TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { Keypair, PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';
import { Connection } from './../Connection';
import { MintTo, CreateAssociatedTokenAccount, CreateMint } from './../programs';
import {
  CreateMasterEdition,
  CreateMetadata,
  Creator,
  MasterEdition,
  Metadata,
  MetadataDataData,
} from './../programs/metadata';
import { Wallet } from './../wallet';
import { sendTransaction } from './transactions';
import { lookup } from './../utils/metadata';

interface MintNFTParams {
  connection: Connection;
  wallet: Wallet;
  uri: string;
  maxSupply: number;
}

interface MintNFTResponse {
  txId: string;
  mint: PublicKey;
  metadata: PublicKey;
  edition: PublicKey;
}

export const mintNFT = async ({
  connection,
  wallet,
  uri,
  maxSupply,
}: MintNFTParams): Promise<MintNFTResponse> => {
  const mint = Keypair.generate();

  const metadataPDA = await Metadata.getPDA(mint.publicKey);
  const editionPDA = await MasterEdition.getPDA(mint.publicKey);

  const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);

  const {
    name,
    symbol,
    seller_fee_basis_points,
    properties: { creators },
  } = await lookup(uri);

  const creatorsData = creators.reduce<Creator[]>((memo, { address, share }) => {
    const verified = address === wallet.publicKey.toString();

    const creator = new Creator({
      address,
      share,
      verified,
    });

    memo = [...memo, creator];

    return memo;
  }, []);

  const createMintTx = new CreateMint(
    { feePayer: wallet.publicKey },
    {
      newAccountPubkey: mint.publicKey,
      lamports: mintRent,
    },
  );

  const metadataData = new MetadataDataData({
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: seller_fee_basis_points,
    creators: creatorsData,
  });

  const createMetadataTx = new CreateMetadata(
    {
      feePayer: wallet.publicKey,
    },
    {
      metadata: metadataPDA,
      metadataData,
      updateAuthority: wallet.publicKey,
      mint: mint.publicKey,
      mintAuthority: wallet.publicKey,
    },
  );

  const recipient = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint.publicKey,
    wallet.publicKey,
  );

  const createAssociatedTokenAccountTx = new CreateAssociatedTokenAccount(
    { feePayer: wallet.publicKey },
    {
      associatedTokenAddress: recipient,
      splTokenMintAddress: mint.publicKey,
    },
  );

  const mintToTx = new MintTo(
    { feePayer: wallet.publicKey },
    {
      mint: mint.publicKey,
      dest: recipient,
      amount: 1,
    },
  );

  const masterEditionTx = new CreateMasterEdition(
    { feePayer: wallet.publicKey },
    {
      edition: editionPDA,
      metadata: metadataPDA,
      updateAuthority: wallet.publicKey,
      mint: mint.publicKey,
      mintAuthority: wallet.publicKey,
      maxSupply: new BN(maxSupply),
    },
  );

  const txId = await sendTransaction({
    connection,
    signers: [mint],
    txs: [
      createMintTx,
      createMetadataTx,
      createAssociatedTokenAccountTx,
      mintToTx,
      masterEditionTx,
    ],
    wallet,
  });

  return {
    txId,
    mint: mint.publicKey,
    metadata: metadataPDA,
    edition: editionPDA,
  };
};

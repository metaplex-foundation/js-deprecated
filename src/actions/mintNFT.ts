import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Connection } from '../Connection';
import {
  CreateMasterEdition,
  CreateMetadata,
  Creator,
  MasterEdition,
  Metadata,
  MetadataDataData,
} from '@metaplex-foundation/mpl-token-metadata';
import { Wallet } from '../wallet';
import { sendTransaction } from './transactions';
import { lookup } from '../utils/metadata';
import { prepareTokenAccountAndMintTxs } from './shared';

/** Parameters for {@link mintNFT} **/
export interface MintNFTParams {
  connection: Connection;
  /** Wallet of the NFT creator and fee payer for the minting action **/
  wallet: Wallet;
  /** URI for a json file compatible with the {@link MetadataJson} format. Note that the `properties` field has to contain at least one creator and one of the provided creators must have the same public key as the provided {@link wallet} **/
  uri: string;
  /** Maximum supply of limited edition prints that can be created from the master edition of the minted NFT **/
  maxSupply?: number;
}

export interface MintNFTResponse {
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
  const { mint, createMintTx, createAssociatedTokenAccountTx, mintToTx } =
    await prepareTokenAccountAndMintTxs(connection, wallet.publicKey);

  const metadataPDA = await Metadata.getPDA(mint.publicKey);
  const editionPDA = await MasterEdition.getPDA(mint.publicKey);

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

  const masterEditionTx = new CreateMasterEdition(
    { feePayer: wallet.publicKey },
    {
      edition: editionPDA,
      metadata: metadataPDA,
      updateAuthority: wallet.publicKey,
      mint: mint.publicKey,
      mintAuthority: wallet.publicKey,
      maxSupply: maxSupply || maxSupply === 0 ? new BN(maxSupply) : null,
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

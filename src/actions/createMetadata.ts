import { Connection, PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import {
  CreateMetadata,
  Metadata,
  MetadataDataData,
} from '@metaplex-foundation/mpl-token-metadata';
import { sendTransaction } from './transactions';

/**
 * Parameters for {@link createMetadata}
 */
export interface CreateMetadataParams {
  connection: Connection;
  /** Will be used as the fee payer, mint authority and a default update authority if {@link updateAuthority} isn't specified **/
  wallet: Wallet;
  /** Can be any mint with 0 decimals **/
  editionMint: PublicKey;
  metadataData: MetadataDataData;
  /**
   * You can optionally specify an updateAuthority different from the provided {@link wallet}
   * @default The updateAuthority will be set to the provided {@link wallet} address if not otherwise specified.
   **/
  updateAuthority?: PublicKey;
}

/**
 * Creates a Metadata program account. This action is used in {@link mintNFT}.
 * @return This action returns the resulting transaction id once it has been executed
 */
export const createMetadata = async (
  { connection, wallet, editionMint, metadataData, updateAuthority } = {} as CreateMetadataParams,
): Promise<string> => {
  const metadata = await Metadata.getPDA(editionMint);

  const createMetadataTx = new CreateMetadata(
    { feePayer: wallet.publicKey },
    {
      metadata,
      metadataData,
      updateAuthority: updateAuthority ?? wallet.publicKey,
      mint: editionMint,
      mintAuthority: wallet.publicKey,
    },
  );
  return sendTransaction({
    connection,
    signers: [],
    txs: [createMetadataTx],
    wallet,
  });
};

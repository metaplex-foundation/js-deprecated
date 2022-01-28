import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Metadata, SignMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { sendTransaction } from './transactions';

/**
 * Parameters for {@link signMetadata}
 */
export interface SignMetadataParams {
  connection: Connection;
  /** Will be used as both the fee payer and {@link signer} if no separate {@link signer} was otherwise specified. If used as a signer, the wallet address must be included in the `creators` array. **/
  wallet: Wallet;
  /** Mint address for the token associated with the {@link Metadata} account **/
  editionMint: PublicKey;
  /** An optional signer. If specified, the signer address must be included in the `creators` array on the {@link Metadata} account data **/
  signer?: Keypair;
}

/**
 * Sign a MetaData account that has the provided wallet as an unverified creator so that it is now verified.
 * @return This action returns the resulting transaction id once it has been executed
 */
export const signMetadata = async (
  { connection, wallet, editionMint, signer } = {} as SignMetadataParams,
): Promise<string> => {
  const metadata = await Metadata.getPDA(editionMint);
  const signTx = new SignMetadata(
    { feePayer: wallet.publicKey },
    {
      metadata,
      creator: signer ? signer.publicKey : wallet.publicKey,
    },
  );
  return await sendTransaction({
    connection,
    signers: signer ? [signer] : [],
    txs: [signTx],
    wallet,
  });
};

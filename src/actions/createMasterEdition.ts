import { Connection, PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import {
  CreateMasterEdition,
  MasterEdition,
  Metadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { sendTransaction } from './transactions';
import BN from 'bn.js';

/** Parameters for {@link createMasterEdition} **/
export interface CreateMasterEditionParams {
  connection: Connection;
  /** The signer and fee payer for the operation. This wallet must be the same signer used to create the {@link Metadata} program account. **/
  wallet: Wallet;
  /** This has to be the same mint provided when creating the {@link Metadata} program account and that account must already exist prior to creating the {@link MasterEdition} account. **/
  editionMint: PublicKey;
  /**
   * You can optionally specify an updateAuthority different from the provided {@link wallet}
   * @default The updateAuthority will be set to the provided {@link wallet} address if not otherwise specified.
   **/
  updateAuthority?: PublicKey;
  maxSupply?: BN;
}

/**
 * Creates a MasterEdition program account.
 *
 * Please note that for this action to execute successfully:
 * 1. A metadata account must already exist
 * 2. There must be exactly 1 editionMint token with 0 decimals outstanding
 * @return This action returns the resulting transaction id once it has been executed
 */
export const createMasterEdition = async (
  { connection, wallet, editionMint, updateAuthority, maxSupply } = {} as CreateMasterEditionParams,
): Promise<string> => {
  const metadata = await Metadata.getPDA(editionMint);
  const edition = await MasterEdition.getPDA(editionMint);

  const createMetadataTx = new CreateMasterEdition(
    { feePayer: wallet.publicKey },
    {
      edition,
      metadata,
      updateAuthority: updateAuthority ?? wallet.publicKey,
      mint: editionMint,
      mintAuthority: wallet.publicKey,
      maxSupply,
    },
  );
  return sendTransaction({
    connection,
    signers: [],
    txs: [createMetadataTx],
    wallet,
  });
};

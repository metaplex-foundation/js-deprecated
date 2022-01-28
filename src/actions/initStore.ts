import { PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { SetStore, Store } from '@metaplex-foundation/mpl-metaplex';

/** Parameters for {@link initStore} **/
export interface InitStoreParams {
  connection: Connection;
  /** Administrator wallet for the store **/
  wallet: Wallet;
  /**
   * - `true`: anyone can list on the store
   * - `false`: only [whitelisted creators](https://docs.metaplex.com/architecture/deep_dive/metaplex#whitelistedcreator) can list on the store
   **/
  isPublic?: boolean;
}

export interface InitStoreResponse {
  storeId: PublicKey;
  txId: string;
}

/**
 * Initialize a {@link Store} account.
 * This action will get a {@link Store} program derived account address for the provided wallet and initialize a store with that address, setting the given `wallet` as the admin
 */
export const initStore = async ({
  connection,
  wallet,
  isPublic = true,
}: InitStoreParams): Promise<InitStoreResponse> => {
  const storeId = await Store.getPDA(wallet.publicKey);
  const tx = new SetStore(
    { feePayer: wallet.publicKey },
    {
      admin: new PublicKey(wallet.publicKey),
      store: storeId,
      isPublic,
    },
  );

  const txId = await sendTransaction({ connection, wallet, txs: [tx] });

  return { storeId, txId };
};

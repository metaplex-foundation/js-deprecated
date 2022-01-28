import { PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { SetStoreV2, Store, StoreConfig } from '@metaplex-foundation/mpl-metaplex';

/** Parameters for {@link initStoreV2} **/
export interface InitStoreV2Params {
  connection: Connection;
  /** Administrator wallet for the store **/
  wallet: Wallet;
  /**
   * - `true`: anyone can list on the store
   * - `false`: only [whitelisted creators](https://docs.metaplex.com/architecture/deep_dive/metaplex#whitelistedcreator) can list on the store
   **/
  isPublic?: boolean;
  settingsUri?: string | null;
}

export interface InitStoreV2Response {
  storeId: PublicKey;
  configId: PublicKey;
  txId: string;
}

/**
 * Initialize a {@link Store} account.
 * This action will get {@link Store} and {@link StoreConfig} program derived account addresses for the provided wallet and initialize a store, setting the given `wallet` as the admin
 */
export const initStoreV2 = async ({
  connection,
  wallet,
  settingsUri = null,
  isPublic = true,
}: InitStoreV2Params): Promise<InitStoreV2Response> => {
  const storeId = await Store.getPDA(wallet.publicKey);
  const configId = await StoreConfig.getPDA(storeId);
  const tx = new SetStoreV2(
    { feePayer: wallet.publicKey },
    {
      admin: new PublicKey(wallet.publicKey),
      store: storeId,
      config: configId,
      isPublic,
      settingsUri,
    },
  );

  const txId = await sendTransaction({ connection, wallet, txs: [tx] });

  return { storeId, configId, txId };
};

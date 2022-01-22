import { PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { SetStoreV2, Store, StoreConfig } from '@metaplex-foundation/mpl-metaplex';

export interface InitStoreV2Params {
  connection: Connection;
  wallet: Wallet;
  isPublic?: boolean;
  settingsUri?: string | null;
}

export interface InitStoreV2Response {
  storeId: PublicKey;
  configId: PublicKey;
  txId: string;
}

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

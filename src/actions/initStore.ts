import { PublicKey } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { SetStore, Store } from '@metaplex-foundation/mpl-metaplex';

export interface InitStoreParams {
  connection: Connection;
  wallet: Wallet;
  isPublic?: boolean;
}

export interface InitStoreResponse {
  storeId: PublicKey;
  txId: string;
}

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

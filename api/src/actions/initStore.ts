import { AnyPublicKey } from '@metaplex/types';
import { PublicKey } from '@solana/web3.js';
import { getProvider } from '../provider';
import { SetStore, Store } from '../programs';
import { sendTransaction } from './transactions';

export const initStore = async (owner: AnyPublicKey, isPublic = true) => {
  const provider = getProvider();
  const storeId = await Store.getPDA(owner);
  const tx = new SetStore(
    { feePayer: provider.wallet.publicKey },
    {
      admin: new PublicKey(owner),
      store: storeId,
      isPublic,
    },
  );

  const txId = await sendTransaction(provider, [tx]);

  return { storeId, txId };
};

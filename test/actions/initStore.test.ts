import { Keypair } from '@solana/web3.js';
import { Connection, NodeWallet } from '../../src';
import { initStore, initStoreV2 } from '../../src/actions';
import { FEE_PAYER, NETWORK } from '../utils';
import { Store } from '@metaplex-foundation/mpl-metaplex';
import { uri } from './shared';

describe('init Store', () => {
  const connection = new Connection(NETWORK);
  const wallet = new NodeWallet(FEE_PAYER);
  let mint: Keypair;

  beforeEach(() => {
    mint = Keypair.generate();
    jest.spyOn(Keypair, 'generate').mockReturnValue(mint);
  });

  test('creates store with initStore', async () => {
    const storeResponse = await initStore({
      connection,
      wallet,
      isPublic: false,
    });

    const storeId = await Store.getPDA(wallet.publicKey);

    expect(storeResponse).toMatchObject({
      storeId,
    });
  });

  test('creates store with initStoreV2', async () => {
    const storeResponse = await initStoreV2({
      connection,
      wallet,
      isPublic: false,
      settingsUri: uri,
    });

    const storeId = await Store.getPDA(wallet.publicKey);

    expect(storeResponse).toMatchObject({
      storeId,
    });
  });

  test('creates store with initStoreV2 without storeV2', async () => {
    const storeResponse = await initStoreV2({
      connection,
      wallet,
      isPublic: false,
    });

    const storeId = await Store.getPDA(wallet.publicKey);

    expect(storeResponse).toMatchObject({
      storeId,
    });
  });
});

import { jest } from '@jest/globals';
import { Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { Connection, SetStore, Store } from '../../src';
import { FEE_PAYER } from '../utils';

describe('Metaplex transactions', () => {
  let connection: Connection;
  let owner: Keypair;

  jest.setTimeout(80000);

  beforeAll(() => {
    connection = new Connection('devnet');
    owner = Keypair.generate();
  });

  test.skip('setStore', async () => {
    const storeId = await Store.getPDA(owner.publicKey);

    const setStoreTx = new SetStore(
      {
        feePayer: FEE_PAYER.publicKey,
      },
      {
        admin: owner.publicKey,
        store: storeId,
        isPublic: true,
      },
    );

    const txid = await sendAndConfirmTransaction(connection, setStoreTx, [FEE_PAYER, owner], {
      commitment: 'confirmed',
    });

    // console.log(txid);
  });
});

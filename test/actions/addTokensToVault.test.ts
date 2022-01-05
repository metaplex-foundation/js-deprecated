import BN from 'bn.js';
import { Transaction } from '@metaplex-foundation/mpl-core';
import { airdrop, LOCALHOST } from '@metaplex-foundation/amman';
import { Keypair, sendAndConfirmTransaction } from '@solana/web3.js';

import { Connection, NodeWallet } from '../../src';
import {
  addTokensToVault,
  createExternalPriceAccount,
  createVault,
  prepareTokenAccountAndMintTxs,
} from '../../src/actions';

describe('addTokensToVault action', () => {
  test('creation and adding of multiple mint tokens to newly created vault', async () => {
    const payer = Keypair.generate();
    const wallet = new NodeWallet(payer);
    const connection = new Connection(LOCALHOST, 'confirmed');
    await airdrop(connection, payer.publicKey, 10);

    const TOKEN_AMOUNT = 2;
    const externalPriceAccountData = await createExternalPriceAccount({ connection, wallet });

    const { vault } = await createVault({
      connection,
      wallet,
      ...externalPriceAccountData,
    });

    const testNfts = [];

    for (let i = 0; i < TOKEN_AMOUNT; i++) {
      const {
        mint,
        recipient: tokenAccount,
        createAssociatedTokenAccountTx,
        createMintTx,
        mintToTx,
      } = await prepareTokenAccountAndMintTxs(connection, wallet.publicKey);

      await sendAndConfirmTransaction(
        connection,
        Transaction.fromCombined([createMintTx, createAssociatedTokenAccountTx, mintToTx]),
        [payer, mint, wallet.payer],
      );

      testNfts.push({
        tokenAccount,
        tokenMint: mint.publicKey,
        amount: new BN(1),
      });
    }

    const { safetyDepositTokenStores } = await addTokensToVault({
      connection,
      wallet,
      vault,
      nfts: testNfts,
    });

    expect(safetyDepositTokenStores.length).toEqual(testNfts.length);
    expect(safetyDepositTokenStores.map(({ tokenMint }) => tokenMint).join(',')).toEqual(
      testNfts.map(({ tokenMint }) => tokenMint).join(','),
    );
  });
});

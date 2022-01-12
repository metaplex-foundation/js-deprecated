import BN from 'bn.js';
import { Transaction } from '@metaplex-foundation/mpl-core';
import { sendAndConfirmTransaction } from '@solana/web3.js';

import { generateConnectionAndWallet } from './shared';
import { addTokensToVault, prepareTokenAccountAndMintTxs } from '../../src/actions';
import { createExternalPriceAccount, createVault } from '../../src/actions/utility';

describe('addTokensToVault action', () => {
  test('creation and adding of multiple mint tokens to newly created vault', async () => {
    const TOKEN_AMOUNT = 2;

    const { connection, wallet, payer } = await generateConnectionAndWallet();

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

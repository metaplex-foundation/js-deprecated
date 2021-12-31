import BN from 'bn.js';
import { Transaction } from '@metaplex-foundation/mpl-core';
import { AccountLayout, MintLayout } from '@solana/spl-token';
import { Keypair, sendAndConfirmTransaction } from '@solana/web3.js';

import { Connection, NodeWallet } from '../../src';
import { FEE_PAYER, pause, NETWORK } from '../utils';
import { CreateMint, CreateTokenAccount, MintTo } from '../../src/programs';
import { addTokensToVault, createExternalPriceAccount, createVault } from '../../src/actions';

describe('addTokensToVault action', () => {
  const connection = new Connection(NETWORK);
  const wallet = new NodeWallet(FEE_PAYER);

  describe('Positive scenario of adding tokens to vault', () => {
    test('creation and adding of multiple mint tokens to newly created vault', async () => {
      const TOKEN_AMOUNT = 2;
      const externalPriceAccountData = await createExternalPriceAccount({ connection, wallet });

      await pause(20000);

      const { vault } = await createVault({
        connection,
        wallet,
        ...externalPriceAccountData,
      });

      const testNfts = [];
      const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
      const accountRent = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

      for (let i = 0; i < TOKEN_AMOUNT; i++) {
        const mint = Keypair.generate();
        const createMintTx = new CreateMint(
          { feePayer: FEE_PAYER.publicKey },
          {
            newAccountPubkey: mint.publicKey,
            lamports: mintRent,
          },
        );

        const tokenAccount = Keypair.generate();
        const createTokenAccountTx = new CreateTokenAccount(
          { feePayer: FEE_PAYER.publicKey },
          {
            newAccountPubkey: tokenAccount.publicKey,
            lamports: accountRent,
            mint: mint.publicKey,
          },
        );

        const mintToTokenAccountTx = new MintTo(
          { feePayer: FEE_PAYER.publicKey },
          {
            mint: mint.publicKey,
            dest: tokenAccount.publicKey,
            amount: 1,
          },
        );

        await sendAndConfirmTransaction(
          connection,
          Transaction.fromCombined([createMintTx, createTokenAccountTx, mintToTokenAccountTx]),
          [FEE_PAYER, mint, tokenAccount, wallet.payer],
          {
            commitment: 'confirmed',
          },
        );

        testNfts.push({
          tokenAccount: tokenAccount.publicKey,
          tokenMint: mint.publicKey,
          amount: new BN(1),
        });
      }

      await pause(20000);

      const { safetyDepositTokenStores } = await addTokensToVault({
        connection,
        wallet,
        vaultPub: vault,
        nfts: testNfts,
      });

      expect(safetyDepositTokenStores.length).toEqual(testNfts.length);
      expect(safetyDepositTokenStores[0].tokenMint).toEqual(testNfts[0].tokenMint);
    }, 120000);
  });
});

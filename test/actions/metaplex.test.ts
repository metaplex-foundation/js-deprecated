import { jest } from '@jest/globals';
import { TupleNumericType, Transaction } from '@metaplex-foundation/mpl-core';
import { AccountLayout, NATIVE_MINT } from '@solana/spl-token';
import { Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import BN from 'bn.js';
import { Connection } from '../../src';
import {
  Store,
  SetStore,
  WhitelistedCreator,
  SetWhitelistedCreator,
  AuctionManager,
  AuctionWinnerTokenTypeTracker,
  InitAuctionManagerV2,
  StartAuction,
} from '@metaplex-foundation/mpl-metaplex';
import { Auction } from '@metaplex-foundation/mpl-auction';
import { CreateTokenAccount } from '../../src/programs/shared';
import { FEE_PAYER, NETWORK, VAULT_PUBKEY } from '../utils';

describe.skip('Metaplex transactions', () => {
  let connection: Connection;
  let owner: Keypair;

  jest.setTimeout(80000);

  beforeAll(() => {
    connection = new Connection(NETWORK);
    owner = Keypair.generate();
  });

  test('setStore', async () => {
    const storeId = await Store.getPDA(owner.publicKey);

    const tx = new SetStore(
      { feePayer: FEE_PAYER.publicKey },
      {
        admin: owner.publicKey,
        store: storeId,
        isPublic: true,
      },
    );

    await sendAndConfirmTransaction(connection, tx, [FEE_PAYER, owner], {
      commitment: 'confirmed',
    });
  });

  test('setWhitelistedCreator', async () => {
    const storeId = await Store.getPDA(owner.publicKey);
    const creator = owner.publicKey;
    const whitelistedCreatorPDA = await WhitelistedCreator.getPDA(storeId, creator);

    const tx = new SetWhitelistedCreator(
      { feePayer: FEE_PAYER.publicKey },
      {
        admin: owner.publicKey,
        store: storeId,
        whitelistedCreatorPDA,
        creator,
        activated: true,
      },
    );

    await sendAndConfirmTransaction(connection, tx, [FEE_PAYER, owner], {
      commitment: 'confirmed',
    });
  });

  test('startAuction', async () => {
    const storeId = await Store.getPDA(owner.publicKey);
    const auctionPDA = await Auction.getPDA(VAULT_PUBKEY);
    const auctionManagerPDA = await AuctionManager.getPDA(auctionPDA);

    const tx = new StartAuction(
      { feePayer: FEE_PAYER.publicKey },
      {
        store: storeId,
        auction: auctionPDA,
        auctionManager: auctionManagerPDA,
        auctionManagerAuthority: owner.publicKey,
      },
    );

    await sendAndConfirmTransaction(connection, tx, [FEE_PAYER, owner], {
      commitment: 'confirmed',
    });
  });

  test('initAuctionManagerV2', async () => {
    const storeId = await Store.getPDA(owner.publicKey);
    const auctionPDA = await Auction.getPDA(VAULT_PUBKEY);
    const auctionManagerPDA = await AuctionManager.getPDA(auctionPDA);
    const tokenTrackerPDA = await AuctionWinnerTokenTypeTracker.getPDA(auctionManagerPDA);

    const paymentAccount = Keypair.generate();
    const mintRent = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
    const createTokenAccountTx = new CreateTokenAccount(
      { feePayer: FEE_PAYER.publicKey },
      {
        newAccountPubkey: paymentAccount.publicKey,
        lamports: mintRent,
        mint: NATIVE_MINT,
      },
    );

    const tx = new InitAuctionManagerV2(
      { feePayer: FEE_PAYER.publicKey },
      {
        store: storeId,
        vault: VAULT_PUBKEY,
        auction: auctionPDA,
        auctionManager: auctionManagerPDA,
        auctionManagerAuthority: owner.publicKey,
        acceptPaymentAccount: paymentAccount.publicKey,
        tokenTracker: tokenTrackerPDA,
        amountType: TupleNumericType.U8,
        lengthType: TupleNumericType.U8,
        maxRanges: new BN(10),
      },
    );

    const txs = Transaction.fromCombined([createTokenAccountTx, tx]);

    await sendAndConfirmTransaction(connection, txs, [FEE_PAYER, paymentAccount, owner], {
      commitment: 'confirmed',
    });
  });
});

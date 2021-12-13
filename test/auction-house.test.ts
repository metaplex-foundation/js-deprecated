import { Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { createAuctionHouse } from '../src/actions/createAuctionHouse';
import { getActionHouseInfo } from '../src/actions/getAuctionHouseInfo';
import { updateAuctionHouse } from '../src/actions/updateAuctionHouse';
import { Connection, NodeWallet } from '../src';
import { FEE_PAYER, NETWORK, pause } from './utils';

jest.setTimeout(80000);

describe('Auction House', () => {
  const connection = new Connection(NETWORK);
  const owner = new NodeWallet(Keypair.generate());
  const txFeeAmount = 10000000;

  beforeAll(async () => {
    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: FEE_PAYER.publicKey,
        toPubkey: owner.publicKey,
        lamports: txFeeAmount,
      }),
    );

    await sendAndConfirmTransaction(connection, transaction, [FEE_PAYER]);
  });

  test('create', async () => {
    await createAuctionHouse({
      connection,
      wallet: owner,
      sellerFeeBasisPoints: 10,
    });

    await pause(20000);

    const auctionHouse = await getActionHouseInfo({ connection, wallet: owner });

    expect(auctionHouse.authority.toBase58()).toEqual(owner.publicKey.toBase58());
  });

  test('update', async () => {
    const sellerFeeBasisPoints = 20;

    await updateAuctionHouse({
      connection,
      wallet: owner,
      sellerFeeBasisPoints,
    });

    await pause(20000);

    const auctionHouse = await getActionHouseInfo({ connection, wallet: owner });

    expect(auctionHouse.sellerFeeBasisPoints).toEqual(sellerFeeBasisPoints);
  });
});

import BN from 'bn.js';
import { NATIVE_MINT } from '@solana/spl-token';
import {
  CreateAuctionArgs,
  PriceFloor,
  PriceFloorType,
  WinnerLimit,
  WinnerLimitType,
} from '@metaplex-foundation/mpl-auction';

import { Connection, NodeWallet } from '../../src';
import { FEE_PAYER, NETWORK, pause } from '../utils';
import { createVault, createExternalPriceAccount, makeAuction } from '../../src/actions';

describe('makeAuction action', () => {
  const connection = new Connection(NETWORK);
  const wallet = new NodeWallet(FEE_PAYER);

  test('making an auction for newly created vault', async () => {
    const externalPriceAccountData = await createExternalPriceAccount({ connection, wallet });

    await pause(20000);

    const { vault } = await createVault({
      connection,
      wallet,
      ...externalPriceAccountData,
    });

    await pause(20000);

    const auctionSettings: CreateAuctionArgs = {
      instruction: 1,
      tickSize: null,
      auctionGap: null,
      endAuctionAt: null,
      gapTickSizePercentage: null,
      winners: new WinnerLimit({
        type: WinnerLimitType.Capped,
        usize: new BN(1),
      }),
      resource: vault.toBase58(),
      tokenMint: NATIVE_MINT.toBase58(),
      authority: wallet.publicKey.toBase58(),
      priceFloor: new PriceFloor({ type: PriceFloorType.Minimum }),
    };

    const { auction } = await makeAuction({
      connection,
      wallet,
      vault,
      auctionSettings,
    });
    expect(Boolean(auction)).not.toBeFalsy();
  }, 50000);
});

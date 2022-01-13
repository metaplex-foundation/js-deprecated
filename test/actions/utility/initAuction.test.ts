import BN from 'bn.js';
import { NATIVE_MINT } from '@solana/spl-token';
import {
  Auction,
  PriceFloor,
  PriceFloorType,
  WinnerLimit,
  WinnerLimitType,
} from '@metaplex-foundation/mpl-auction';

import { sleep } from '../../utils';
import { generateConnectionAndWallet } from '../shared';
import { createExternalPriceAccount, createVault, initAuction } from '../../../src/actions/utility';

describe('initAuction action', () => {
  test('making an auction for newly created vault', async () => {
    const { connection, wallet } = await generateConnectionAndWallet();

    const externalPriceAccountData = await createExternalPriceAccount({ connection, wallet });

    const { vault } = await createVault({
      connection,
      wallet,
      ...externalPriceAccountData,
    });

    const auctionSettings = {
      instruction: 1,
      tickSize: null,
      auctionGap: null,
      endAuctionAt: null,
      gapTickSizePercentage: null,
      winners: new WinnerLimit({
        type: WinnerLimitType.Capped,
        usize: new BN(1),
      }),
      tokenMint: NATIVE_MINT.toBase58(),
      priceFloor: new PriceFloor({ type: PriceFloorType.Minimum }),
    };

    const { auction } = await initAuction({
      connection,
      wallet,
      vault,
      auctionSettings,
    });

    await sleep(1000);

    const auctionInstance = await Auction.load(connection, auction);

    expect(auctionInstance).toHaveProperty('data');
    expect(auctionInstance.data.tokenMint).toEqual(NATIVE_MINT.toBase58());
  });
});

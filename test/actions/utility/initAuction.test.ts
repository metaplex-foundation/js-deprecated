import BN from 'bn.js';
import { Keypair } from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';
import {
  PriceFloor,
  PriceFloorType,
  WinnerLimit,
  WinnerLimitType,
} from '@metaplex-foundation/mpl-auction';
import { airdrop, LOCALHOST } from '@metaplex-foundation/amman';

import { Connection, NodeWallet } from '../../../src';
import { createExternalPriceAccount, createVault, initAuction } from '../../../src/actions/utility';

describe('initAuction action', () => {
  test('making an auction with newly created vault', async () => {
    const payer = Keypair.generate();
    const wallet = new NodeWallet(payer);
    const connection = new Connection(LOCALHOST, 'confirmed');
    await airdrop(connection, payer.publicKey, 10);

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

    expect(Boolean(auction)).not.toBeFalsy();
  });
});

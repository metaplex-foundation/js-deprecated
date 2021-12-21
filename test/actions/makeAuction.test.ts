import { Connection, NodeWallet } from '../../src';
import {
  createVault,
  createExternalPriceAccount,
  makeAuction,
  IPartialCreateAuctionArgs,
} from '../../src/actions';
import { FEE_PAYER, pause } from '../utils';
import { Vault, VaultState } from '@metaplex-foundation/mpl-token-vault';
import { WinnerLimit, WinnerLimitType } from '@metaplex-foundation/mpl-auction';
import BN from 'bn.js';
import { NATIVE_MINT } from '@solana/spl-token';

describe('making an Auction', () => {
  const connection = new Connection('devnet');
  const wallet = new NodeWallet(FEE_PAYER);

  describe('success', () => {
    test('makes an auction', async () => {
      const externalPriceAccountData = await createExternalPriceAccount({ connection, wallet });

      await pause(20000);

      const vaultResponse = await createVault({
        connection,
        wallet,
        ...externalPriceAccountData,
      });

      await pause(20000);
      const vault = await Vault.load(connection, vaultResponse.vault);
      expect(vault).toHaveProperty('data');
      expect(vault.data.state).toEqual(VaultState.Inactive);

      const auctionSettings: IPartialCreateAuctionArgs = {
        winners: new WinnerLimit({
          type: WinnerLimitType.Capped,
          usize: new BN(1),
        }),
        endAuctionAt: null,
        auctionGap: null,
        gapTickSizePercentage: null,
        instantSalePrice: null,
        name: null,
        priceFloor: null,
        tickSize: null,
        tokenMint: NATIVE_MINT.toBase58(),
      };

      const makeAuctionResponse = await makeAuction({
        connection,
        wallet,
        vault: vaultResponse.vault,
        auctionSettings,
      });
      expect(makeAuctionResponse).not.toBeNull();
    }, 70000);
  });
});

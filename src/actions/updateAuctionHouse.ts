import { PublicKey, PublicKeyInitData, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import { deserialize, Transaction } from '@metaplex-foundation/mpl-core';
import { Connection, Wallet } from '../';
import { sendTransaction } from './';
import { AuctionHouseProgram } from './auction-house/AuctionHouseProgram';
import { AuctionHouseAccount } from './auction-house/AuctionHouseAccount';

interface UpdateAuctionHouseParams {
  connection: Connection;
  wallet: Wallet;
  sellerFeeBasisPoints?: number;
  canChangeSalePrice?: boolean;
  requiresSignOff?: boolean;
  treasuryWithdrawalDestination?: PublicKeyInitData;
  feeWithdrawalDestination?: PublicKeyInitData;
  treasuryMint?: PublicKeyInitData;
  auctionHouse?: PublicKeyInitData;
  newAuthority?: PublicKeyInitData;
}

export const updateAuctionHouse = async (params: UpdateAuctionHouseParams) => {
  const {
    connection,
    wallet,
    sellerFeeBasisPoints,
    canChangeSalePrice,
    requiresSignOff,
    treasuryWithdrawalDestination,
    feeWithdrawalDestination,
    treasuryMint,
    auctionHouse,
    newAuthority,
  } = params;

  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: 'recent',
  });

  const anchorProgram = new AuctionHouseProgram(provider);

  let tMintKey = treasuryMint ? new PublicKey(treasuryMint) : NATIVE_MINT;

  const auctionHouseKey = auctionHouse
    ? new PublicKey(auctionHouse)
    : (await AuctionHouseAccount.getAuctionHouse(wallet.publicKey, tMintKey))[0];

  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(auctionHouseKey);

  tMintKey = auctionHouseObj.treasuryMint;

  let twdKey: PublicKey;
  if (!treasuryWithdrawalDestination) {
    twdKey = new PublicKey(treasuryWithdrawalDestination);
  } else {
    twdKey = tMintKey.equals(NATIVE_MINT)
      ? auctionHouseObj.treasuryWithdrawalDestination
      : deserialize(
          Buffer.from(
            (
              await anchorProgram.provider.connection.getAccountInfo(
                auctionHouseObj.treasuryWithdrawalDestination,
              )
            ).data,
          ),
        ).owner;
  }

  const fwdKey = feeWithdrawalDestination
    ? new PublicKey(feeWithdrawalDestination)
    : auctionHouseObj.feeWithdrawalDestination;

  const twdAta = tMintKey.equals(NATIVE_MINT)
    ? twdKey
    : (await AuctionHouseAccount.getAtaForMint(tMintKey, twdKey))[0];

  const sfbp = sellerFeeBasisPoints ? sellerFeeBasisPoints : auctionHouseObj.sellerFeeBasisPoints;

  const newAuth = newAuthority ? new PublicKey(newAuthority) : auctionHouseObj.authority;

  const ccsp = canChangeSalePrice ?? auctionHouseObj.canChangeSalePrice;

  const rso = requiresSignOff ?? auctionHouseObj.requiresSignOff;

  const updateAuctionHouseTx = new Transaction();

  updateAuctionHouseTx.add(
    anchorProgram.instruction.updateAuctionHouse(sfbp, rso, ccsp, {
      accounts: {
        treasuryMint: tMintKey,
        payer: wallet.publicKey,
        authority: wallet.publicKey,
        newAuthority: newAuth,
        feeWithdrawalDestination: fwdKey,
        treasuryWithdrawalDestination: twdAta,
        treasuryWithdrawalDestinationOwner: twdKey,
        auctionHouse: auctionHouseKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }),
  );

  return sendTransaction({
    connection,
    signers: [],
    txs: [updateAuctionHouseTx],
    wallet,
  });
};

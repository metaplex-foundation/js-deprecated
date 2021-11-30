import { ParamsWithStore } from '@metaplex/types';
import { Borsh } from '@metaplex/utils';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionCtorFields,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
import { Transaction } from '../../../Transaction';
import { MetadataProgram } from '../../metadata';
import { VaultProgram } from '../../vault';
import { MetaplexProgram } from '../MetaplexProgram';

export class RedeemPrintingV2BidArgs extends Borsh.Data<{ editionOffset: BN; winIndex: BN }> {
  static readonly SCHEMA = this.struct([
    ['instruction', 'u8'],
    ['editionOffset', 'u64'],
    ['winIndex', 'u64'],
  ]);

  instruction = 14;
  editionOffset: BN;
  winIndex: BN;
}

type RedeemPrintingV2BidParams = {
  vault: PublicKey;
  auction: PublicKey;
  auctionManager: PublicKey;
  bidRedemption: PublicKey;
  bidMetadata: PublicKey;
  safetyDepositTokenStore: PublicKey;
  destination: PublicKey;
  safetyDeposit: PublicKey;
  fractionMint: PublicKey;
  bidder: PublicKey;
  safetyDepositConfig: PublicKey;
  auctionExtended: PublicKey;
  metadata: PublicKey;
  prizeTrackingTicket: PublicKey;
  newMetadata: PublicKey;
  newEdition: PublicKey;
  masterEdition: PublicKey;
  newMint: PublicKey;
  editionMark: PublicKey;
};

export class RedeemPrintingV2Bid extends Transaction {
  constructor(options: TransactionCtorFields, params: ParamsWithStore<RedeemPrintingV2BidParams>) {
    super(options);
    const { feePayer } = options;
    const {
      store,
      vault,
      auction,
      auctionExtended,
      auctionManager,
      bidRedemption,
      bidMetadata,
      safetyDepositTokenStore,
      destination,
      safetyDeposit,
      bidder,
      safetyDepositConfig,
      metadata,
      prizeTrackingTicket,
      newMetadata,
      newEdition,
      masterEdition,
      newMint,
      editionMark,
    } = params;

    const data = RedeemPrintingV2BidArgs.serialize();

    this.add(
      new TransactionInstruction({
        keys: [
          {
            pubkey: auctionManager,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: safetyDepositTokenStore,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: destination,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: bidRedemption,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: safetyDeposit,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: vault,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: safetyDepositConfig,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: auction,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: bidMetadata,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: bidder,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: feePayer,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: VaultProgram.PUBKEY,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: MetadataProgram.PUBKEY,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: store,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: prizeTrackingTicket,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: newMetadata,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: newEdition,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: masterEdition,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: newMint,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: editionMark,
            isSigner: false,
            isWritable: true,
          },
          {
            // Mint authority (this) is going to be the payer since the bidder
            // may not be signer hre - we may be redeeming for someone else (permissionless)
            // and during the txn, mint authority is removed from us and given to master edition.
            // The ATA account is already owned by bidder by default. No signing needed
            pubkey: feePayer,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: metadata,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: auctionExtended,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: MetaplexProgram.PUBKEY,
        data,
      }),
    );
  }
}

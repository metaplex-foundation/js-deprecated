import { Program } from '../Program'
import { PublicKey } from '@solana/web3.js'

export enum MetaplexKey {
  Uninitialized = 0,
  OriginalAuthorityLookupV1 = 1,
  BidRedemptionTicketV1 = 2,
  StoreV1 = 3,
  WhitelistedCreatorV1 = 4,
  PayoutTicketV1 = 5,
  SafetyDepositValidationTicketV1 = 6,
  AuctionManagerV1 = 7,
  PrizeTrackingTicketV1 = 8,
  SafetyDepositConfigV1 = 9,
  AuctionManagerV2 = 10,
  BidRedemptionTicketV2 = 11,
  AuctionWinnerTokenTypeTrackerV1 = 12,
}

export class MetaplexProgram<T> extends Program<T> {
  static readonly PREFIX = 'metaplex'
  static readonly PUBKEY = new PublicKey('p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98')

  isOwner() {
    return this.info?.owner.equals(MetaplexProgram.PUBKEY)
  }
}

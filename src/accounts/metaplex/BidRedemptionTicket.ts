import { AnyPublicKey, StringPublicKey } from "../../types";
import { MetaplexProgram, MetaplexKey } from "./MetaplexProgram";
import { AccountInfo } from "@solana/web3.js";
import BN from "bn.js";
import bs58 from "bs58";

export interface BidRedemptionTicketV2Data {
  key: MetaplexKey;
  winnerIndex: BN | null;
  auctionManager: StringPublicKey;
  data: number[];
}

export class BidRedemptionTicket extends MetaplexProgram<BidRedemptionTicketV2Data> {
  constructor(pubkey: AnyPublicKey, info?: AccountInfo<Buffer>) {
    super(pubkey, info);

    if (this.info && this.isOwner()) {
      if (BidRedemptionTicket.isBidRedemptionTicketV1(this.info.data)) {
        throw new Error("BidRedemptionTicketV1 is deprecated");
      } else if (BidRedemptionTicket.isBidRedemptionTicketV2(this.info.data)) {
        const data = this.info.data.toJSON().data;

        let winnerIndex: BN | null;

        let offset = 2;
        if (data[1] == 0) {
          winnerIndex = null;
        } else {
          winnerIndex = new BN(data.slice(1, 9), "le");
          offset += 8;
        }

        this.data = {
          key: MetaplexKey.BidRedemptionTicketV2,
          winnerIndex,
          data,
          auctionManager: bs58.encode(data.slice(offset, offset + 32)),
        };
      }
    }
  }

  static isBidRedemptionTicket(data: Buffer) {
    return (
      BidRedemptionTicket.isBidRedemptionTicketV1(data) ||
      BidRedemptionTicket.isBidRedemptionTicketV2(data)
    );
  }

  static isBidRedemptionTicketV1(data: Buffer) {
    return data[0] === MetaplexKey.BidRedemptionTicketV1;
  }

  static isBidRedemptionTicketV2(data: Buffer) {
    return data[0] === MetaplexKey.BidRedemptionTicketV2;
  }
}

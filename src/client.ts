import { Connection } from "./Connection";
import { AuctionHouseClient } from "./auctionHouse";

export class MetaplexClient {
    private auctionHouseClient: AuctionHouseClient;
    // private metadataClient: MetadataClient; EXAMPLE OF OTHER FEATURES

    constructor(private connection: Connection) { }

    get AuctionHouse() {
        this.auctionHouseClient = this.auctionHouseClient || new AuctionHouseClient(this.connection);
        return this.auctionHouseClient
    }

    // get Metadata() {
    //     this.metadataClient = this.metadataClient || new MetadataClient(this.connection); EXAMPLE OF OTHER FEATURES
    //     return this.metadataClient;
    // }

}
export const Metaplex = {
    AuctionHouse: AuctionHouseClient,
    // Metadata: MetadataClient, EXAMPLE OF OTHER FEATURES
};
import { Connection, PublicKey } from "@solana/web3.js";
import { AuctionHouseSettings } from "./settings";
import { AuctionHouseStats } from "./stats";

export class AuctionHouseClient {
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    loadAuctionHouse(auctionHouseKey: PublicKey): Promise<AuctionHouse> {
        return new AuctionHouse({}).refresh();
    }

    createAuctionHouse(settings: AuctionHouseSettings): Promise<AuctionHouse> {
        return new AuctionHouse({}).refresh();
    }

    updateAuctionHouse(auctionHouseKey: PublicKey, settings: AuctionHouseSettings): Promise<AuctionHouse> {
        return new AuctionHouse({}).refresh();
    }
}

export class AuctionHouse {
    private settings: AuctionHouseSettings;
    private stats: AuctionHouseStats;
    constructor(settings?: AuctionHouseSettings) {
        this.settings = settings;
    }
    private checkInitialized() {
        return this.settings && this.stats;
    }

    async refresh(): Promise<AuctionHouse> {
        //TODO: refresh stats and settings
        return this;
    }

    async show() {

    }

    async bid() {

    }

    async list() {

    }

    async buy() {

    }

    async sell() {

    }

    async execute_sale() {

    }

    async execute_sale_with_price() {

    }

    async deposit() {

    }
}
import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';

export interface CandyMachine {
    authority: PublicKey,
    wallet: PublicKey,
    token_mint?: PublicKey,
    config: PublicKey,
    data: CandyMachineData,
    items_redeemed: BN,
    bump: number,
}

export interface CandyMachineData {
    uuid: string,        // string
    price: BN,           // u64
    items_available: BN, // u64
    go_live_date?: BN,   // Option<i64>
}
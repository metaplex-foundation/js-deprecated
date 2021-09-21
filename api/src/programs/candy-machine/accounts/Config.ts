import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';

export interface Config {
    authority: PublicKey,
    data: ConfigData,
    // there's a borsh vec u32 denoting how many actual lines of data there are currently (eventually equals max number of lines)
    // There is actually lines and lines of data after this but we explicitly never want them deserialized.
    // here there is a borsh vec u32 indicating number of bytes in bitmask array.
    // here there is a number of bytes equal to ceil(max_number_of_lines/8) and it is a bit mask used to figure out when to increment borsh vec u32
}

export interface ConfigData {
    uuid: String,
    symbol: String,
    seller_fee_basis_points: number, // u16
    creators: Creator[],             // Vec<Creator>
    max_supply: BN,                  // u64
    is_mutable: boolean,             //
    retain_authority: boolean,       //
    max_number_of_lines: number      // u32
}

export interface Creator {
    address: PublicKey,
    verified: boolean,
    share: number, // u8
}

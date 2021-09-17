import { Keypair, PublicKey } from '@solana/web3.js';

// Devnet fee payer
export const FEE_PAYER = Keypair.fromSecretKey(
  new Uint8Array([
    225, 60, 117, 68, 123, 252, 1, 200, 41, 251, 54, 121, 6, 167, 204, 18, 140, 168, 206, 74, 254,
    156, 230, 10, 212, 124, 162, 85, 120, 78, 122, 106, 187, 209, 148, 182, 34, 149, 175, 173, 192,
    85, 175, 252, 231, 130, 76, 40, 175, 177, 44, 111, 250, 168, 3, 236, 149, 34, 236, 19, 46, 9,
    66, 138,
  ]),
);

export const STORE_OWNER_PUBKEY = new PublicKey('7hKMAoCYJuBnBLmVTjswu7m6jcwyE8MYAP5hPijUT6nd');
export const STORE_PUBKEY = new PublicKey('DNQzo4Aggw8PneX7BGY7niEkB8wfNJwx6DpV9BLBUUFF');
export const AUCTION_MANAGER_PUBKEY = new PublicKey('Gjd1Mo8KLEgywxMKaDRhaoD2Fu8bzoVLZ8H7v761XXkf');
export const AUCTION_PUBKEY = new PublicKey('BTE7AqJn4aG2MKZnaSTEgbQ4aCgPTDmphs5uxDnuDqvQ');
export const AUCTION_EXTENDED_PUBKEY = new PublicKey(
  '9nUKpweEWpk5mQiBzxYWB62dhQR5NtaZDShccqsWnPGa',
);
export const VAULT_PUBKEY = new PublicKey('BE43QppYzwWVVSobScMbPgqKogPHsHQoogXgLH3ZTFtW');
export const METADATA_PUBKEY = new PublicKey('CZkFeERacU42qjApPyjamS13fNtz7y1wYLu5jyLpN1WL');
export const MASTER_EDITION_PUBKEY = new PublicKey('EZ5xB174dcz982WXV2aNr4zSW5ywAH3gP5Lbj8CuRMw4');
export const PACKSET_PUBKEY = new PublicKey('AN1bTGLCLSoSTJMeBPa7KGRDF5BpbfvD7oA42ZMq27Ru');
export const PACKCARD_PUBKEY = new PublicKey('BVrBhek71ZDDPQ8tYucBiEKxYmmtQLioF3eJJnhH6md4');
export const PACKVOUCHER_PUBKEY = new PublicKey('Ah6ngnNfhzKFfMPtiK5BeQ4mF5Nzwv1bwtbAEgMYH6Dp');
export const PROVING_PROCESS_PUBKEY = new PublicKey('HCzXvi3L1xdkFp5jafadFGzbirua9U4r4ePiXvcqH81R');

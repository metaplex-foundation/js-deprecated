import { Connection, Metadata } from '@metaplex/js';
import { Keypair, PublicKey } from '@solana/web3.js';

const payer = Keypair.fromSecretKey(
  new Uint8Array([
    225, 60, 117, 68, 123, 252, 1, 200, 41, 251, 54, 121, 6, 167, 204, 18, 140, 168, 206, 74, 254,
    156, 230, 10, 212, 124, 162, 85, 120, 78, 122, 106, 187, 209, 148, 182, 34, 149, 175, 173, 192,
    85, 175, 252, 231, 130, 76, 40, 175, 177, 44, 111, 250, 168, 3, 236, 149, 34, 236, 19, 46, 9,
    66, 138,
  ]),
);
const metadataPubkey = new PublicKey('CZkFeERacU42qjApPyjamS13fNtz7y1wYLu5jyLpN1WL');
const connection = new Connection('devnet');

const run = async () => {
  // TODO: just waiting for layer service with combine
  console.time('ownedMetadata');
  const ownedMetadata = await Metadata.getMetdataByOwner(connection, payer.publicKey);
  console.log(ownedMetadata);
  console.timeEnd('ownedMetadata');

  const metadata = await Metadata.load(connection, metadataPubkey);
  console.log(metadata);
};

run();

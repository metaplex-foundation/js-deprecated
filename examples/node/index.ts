import { Connection, Metadata } from '@metaplex/js';
import { PublicKey } from '@solana/web3.js';

const metadataPubkey = new PublicKey('CZkFeERacU42qjApPyjamS13fNtz7y1wYLu5jyLpN1WL');
const connection = new Connection('devnet');

const run = async () => {
  const metadata = await Metadata.load(connection, metadataPubkey);
  console.log(metadata);
};

run();

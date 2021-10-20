import { PublicKey } from '@solana/web3.js';
import { programs, Connection } from '@metaplex/js';

const { Metadata } = programs.metadata;

const metadataPubkey = new PublicKey('CZkFeERacU42qjApPyjamS13fNtz7y1wYLu5jyLpN1WL');
const connection = new Connection('devnet');
const btn = document.getElementById('metadata');

const run = async () => {
  btn.addEventListener('click', async () => {
    const metadata = await Metadata.load(connection, metadataPubkey);
    console.log(metadata);
  });
};

run();

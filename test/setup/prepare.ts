import fs from 'fs';
import path from 'path';
import { LOCAL_NETWORK, projectRoot, testCreatorKeypairPath } from '../utils';
import { PUBKEY_TO_LABEL } from './keys';

const keypairPath = testCreatorKeypairPath;
const configPath = path.join(__dirname, '..', 'config', 'solana-validator.yml');
const labels = Object.entries(PUBKEY_TO_LABEL)
  .map(([pubkey, label]: [pubkey: string, label: string]) => {
    return `${pubkey}: ${label}`;
  })
  .join('\n  ');

const config = `---
json_rpc_url: ${LOCAL_NETWORK}
websocket_url: ""
keypair_path: ${keypairPath}
address_labels:
  ${labels}
commitment: confirmed
`;

export function prepareConfig() {
  process.chdir(projectRoot);
  fs.writeFileSync(configPath, config, 'utf8');
}

prepareConfig();

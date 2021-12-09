import { execSync, spawn } from 'child_process';
import { strict as assert } from 'assert';
import { prepareConfig } from './prepare';
import {
  logError,
  logInfo,
  logDebug,
  logTrace,
  ledgerDir,
  pause,
  TEST_CREATOR,
  solanaConfigPath,
  rustDir,
} from '../utils';
import { PUBLIC_KEYS } from '../utils';
import path from 'path';

const localDeployDir = path.join(rustDir, 'target', 'deploy');

function localDeployPath(programName: string) {
  return path.join(localDeployDir, `${programName}.so`);
}

const programs: Record<string, string> = {
  metadata: localDeployPath('mpl_token_metadata'),
  vault: localDeployPath('mpl_token_vault'),
  auction: localDeployPath('mpl_auction'),
  metaplex: localDeployPath('mpl_metaplex'),
};

const programIds = {
  metadata: PUBLIC_KEYS['prog:metaplex'],
  vault: PUBLIC_KEYS['prog:token_vault'],
  auction: PUBLIC_KEYS['prog:auction'],
  metaplex: PUBLIC_KEYS['prog:metaplex'],
};

async function main() {
  logInfo('Preparing config');
  prepareConfig();

  try {
    execSync('killall -9 solana-test-validator');
    logInfo('Killed currently running solana-test-validator');
    await pause(1000);
  } catch (err) {}

  const args = ['--config', solanaConfigPath, '--reset', '--ledger', ledgerDir];

  Object.entries(programIds).forEach(([label, id]) => {
    const programFile = programs[label];
    args.push('--bpf-program');
    args.push(id);
    args.push(programFile);
  });

  const cmd = `solana-test-validator ${args.join(' \\\n  ')}`;
  logTrace(cmd);
  const child = spawn('solana-test-validator', args, {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  logInfo(
    '+++ Spawned new solana-test-validator with programs predeployed and ledger at %s',
    ledgerDir,
  );

  await pause(2000);

  // -----------------
  // Test Creator
  // -----------------

  const key = execSync(`solana-keygen --config ${solanaConfigPath} pubkey`).toString().trim();
  logInfo(`Account Pubkey is ${key}`);
  assert.equal(key, TEST_CREATOR, 'configured key should be test creator');

  const keypair = execSync(`solana -C ${solanaConfigPath} config get keypair`).toString();
  logInfo(`Test Creator ${keypair}`);
  logDebug(`key: ${key}`);
  const testCreator = execSync(`solana -C ${solanaConfigPath} account ${key}`);
  logDebug(`Test Creator Account Info ${testCreator}`);

  logInfo('Done');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    logError(err);
    if (err.stderr != null) {
      logError(err.stderr.toString());
    }
    process.exit(1);
  });

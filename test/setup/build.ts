import { execSync } from 'child_process';
import { renameSync, rmSync } from 'fs';
import { projectRoot } from '../utils';

const rustGithubRepository = 'metaplex-program-library';
const repostitoryDir = `${rustGithubRepository}-master`;

const rustProgramsRepository = `https://github.com/metaplex-foundation/${rustGithubRepository}/archive/refs/heads/master.zip`;

function build() {
  const programs: string[] = [
    'auction/program',
    'token-metadata/program',
    'token-vault/program',
    'metaplex/program',
  ];

  process.chdir('test');
  rmSync(repostitoryDir, { recursive: true, force: true });
  rmSync('rust', { recursive: true, force: true });
  rmSync('./master.zip', { force: true });

  execSync(`wget --quiet ${rustProgramsRepository}`);
  execSync('unzip master.zip');

  programs.forEach((directory) => {
    process.chdir(`${projectRoot}/test/${repostitoryDir}/${directory}`);
    execSync('cargo build-bpf');
  });

  process.chdir(`${projectRoot}/test`);
  renameSync(repostitoryDir, 'rust');
}

build();

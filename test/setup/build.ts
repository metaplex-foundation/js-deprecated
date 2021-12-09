import { execSync } from 'child_process';
import { dir } from 'console';
import { renameSync, rmSync } from 'fs';
import { projectRoot } from '../utils';

const directoryRepository = 'metaplex-program-library-master';

const rustProgramsRepository =
  'https://github.com/metaplex-foundation/metaplex-program-library/archive/refs/heads/master.zip';

async function build() {
  const programs: string[] = [
    'auction/program',
    'token-metadata/program',
    'token-vault/program',
    'metaplex/program',
  ];

  process.chdir('test');
  rmSync('metaplex-program-library-master', { recursive: true, force: true });
  rmSync('rust', { recursive: true, force: true });
  rmSync('./master.zip', { force: true });

  execSync(`wget --quiet ${rustProgramsRepository}`);
  execSync('unzip master.zip');

  programs.forEach((directory) => {
    process.chdir(`${projectRoot}/test/${directoryRepository}/${directory}`);
    execSync('cargo build-bpf');
  });

  process.chdir(`${projectRoot}/test`);
  renameSync(directoryRepository, 'rust');
}

build();

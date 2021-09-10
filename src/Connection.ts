import { Commitment, clusterApiUrl, Connection as SolanaConnection } from '@solana/web3.js';
import { ENV as ChainId } from '@solana/spl-token-registry';

export const ENV: Record<string, { endpoint: string; ChainId: ChainId }> = {
  'mainnet-beta': {
    endpoint: 'https://api.metaplex.solana.com/',
    ChainId: ChainId.MainnetBeta,
  },
  'mainnet-beta (Solana)': {
    endpoint: 'https://api.mainnet-beta.solana.com',
    ChainId: ChainId.MainnetBeta,
  },
  'mainnet-beta (Serum)': {
    endpoint: 'https://solana-api.projectserum.com/',
    ChainId: ChainId.MainnetBeta,
  },
  testnet: {
    endpoint: clusterApiUrl('testnet'),
    ChainId: ChainId.Testnet,
  },
  devnet: {
    endpoint: clusterApiUrl('devnet'),
    ChainId: ChainId.Devnet,
  },
};

export class Connection extends SolanaConnection {
  constructor(endpoint: keyof typeof ENV | string = 'mainnet-beta', commitment?: Commitment) {
    if (endpoint in ENV) endpoint = ENV[endpoint].endpoint;
    super(endpoint, commitment);
  }
}

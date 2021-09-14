// TODO: need to be able to overwrite dynamically
export const config = {
  arweaveWallet: process.env.ARWEAVE_WALLET || 'HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm',
  programs: {
    // Metaplex
    auction: process.env.AUCTION_PROGRAM || 'auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8',
    metadata: process.env.METADATA_PROGRAM || 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
    metaplex: process.env.METAPLEX_PROGRAM || 'p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98',
    vault: process.env.VAULT_PROGRAM || 'vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn',
    // External
    memo: process.env.MEMO_PROGRAM || 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
  },
};

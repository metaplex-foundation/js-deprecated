import { Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

interface CreateApproveParams {
  authority?: Keypair;
  account: PublicKey;
  owner: PublicKey;
  amount: number | u64;
}

export function createApproveTxs({
  authority = Keypair.generate(),
  account,
  owner,
  amount,
}: CreateApproveParams) {
  const createApproveTx = new Transaction().add(
    Token.createApproveInstruction(
      TOKEN_PROGRAM_ID,
      account,
      authority.publicKey,
      owner,
      [],
      amount,
    ),
  );
  const createRevokeTx = new Transaction().add(
    Token.createRevokeInstruction(TOKEN_PROGRAM_ID, account, owner, []),
  );
  return { authority, createApproveTx, createRevokeTx };
}

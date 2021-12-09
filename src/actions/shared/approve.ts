import { Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

export function createApproveTxs(account: PublicKey, owner: PublicKey, amount: number | u64) {
  const authority = Keypair.generate();
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

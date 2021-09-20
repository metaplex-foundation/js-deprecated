import { borsh } from '@metaplex/utils';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionCtorFields,
  TransactionInstruction,
} from '@solana/web3.js';
import { Transaction } from '../../../Transaction';
import { MetaplexProgram } from '../MetaplexProgram';

export interface SetWhitelistedCreatorArgs {
  instruction: number;
  activated: boolean;
}

const setWhitelistedCreatorStruct = borsh.struct<SetWhitelistedCreatorArgs>([
  ['instruction', 'u8'],
  ['activated', 'u8'],
]);

type SetWhitelistedCreatorParams = {
  store: PublicKey;
  admin: PublicKey;
  whitelistedCreatorPDA: PublicKey;
  creator: PublicKey;
  activated: boolean;
};

export class SetWhitelistedCreator extends Transaction {
  constructor(options: TransactionCtorFields, params: SetWhitelistedCreatorParams) {
    super(options);
    const { feePayer } = options;
    const { admin, whitelistedCreatorPDA, store, creator, activated } = params;

    const data = setWhitelistedCreatorStruct.serialize({ instruction: 8, activated });

    this.add(
      new TransactionInstruction({
        keys: [
          {
            pubkey: whitelistedCreatorPDA,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: admin,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: feePayer,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: creator,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: store,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: MetaplexProgram.PUBKEY,
        data,
      }),
    );
  }
}

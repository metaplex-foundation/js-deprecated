import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionCtorFields,
  TransactionInstruction,
} from '@solana/web3.js';
import { borsh } from '@metaplex/utils';
import { Transaction } from '../../../Transaction';
import { VaultProgram } from '../../vault';
import { MetadataProgram } from '../../metadata';
import { AuctionProgram } from '../../auction';
import { MetaplexProgram } from '../MetaplexProgram';

export interface SetStoreArgs {
  instruction: number;
  public: boolean;
}

const setStoreStruct = borsh.struct<SetStoreArgs>([
  ['instruction', 'u8'],
  ['public', 'u8'],
]);

type SetStoreParams = {
  store: PublicKey;
  admin: PublicKey;
  isPublic: boolean;
};

export class SetStore extends Transaction {
  constructor(options: TransactionCtorFields, params: SetStoreParams) {
    super(options);
    const { feePayer } = options;
    const { admin, store, isPublic } = params;

    const data = setStoreStruct.serialize({ instruction: 8, public: isPublic });

    this.add(
      new TransactionInstruction({
        keys: [
          {
            pubkey: store,
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
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          {
            pubkey: VaultProgram.PUBKEY,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: MetadataProgram.PUBKEY,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: AuctionProgram.PUBKEY,
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

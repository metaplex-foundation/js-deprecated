import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { Wallet } from '../wallet';
import { Connection } from '../Connection';
import { sendTransaction } from './transactions';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { serialize } from 'borsh';


class EmptyPaymentAccountArgs {
  instruction = 7;
  winningConfigIndex: number | null;
  winningConfigItemIndex: number | null;
  creatorIndex: number | null;
  constructor(args: {
    winningConfigIndex: number | null;
    winningConfigItemIndex: number | null;
    creatorIndex: number | null;
  }) {
    this.winningConfigIndex = args.winningConfigIndex;
    this.winningConfigItemIndex = args.winningConfigItemIndex;
    this.creatorIndex = args.creatorIndex;
  }
}

const EMPTY_PAYMENT_ACCOUNT = new Map<Function, any>([[
  EmptyPaymentAccountArgs,
  {
    kind: 'struct',
    fields: [
      ['instruction', 'u8'],
      ['winningConfigIndex', { kind: 'option', type: 'u8' }],
      ['winningConfigItemIndex', { kind: 'option', type: 'u8' }],
      ['creatorIndex', { kind: 'option', type: 'u8' }],
    ],
  },
]

]);

/**
 * Parameters for {@link emptypaymentaccount}
 */
export interface emptyAccountParams {
  connection: Connection;
  /** Wallet of the bidder the bid that is being placed belongs to **/
  wallet: Wallet;

  /** Accept payment info account ie the escrow account**/
  escrowAccount: PublicKey;

  /** destination address **/
  destination: PublicKey;

  /** auction manger **/
  auctionManager: PublicKey;

  /** winning config **/
  winningConfigIndex: number | null | undefined;

  /** winning config **/
  winningConfigItemIndex: number | null | undefined;

  /** winning config **/
  creatorIndex: number | null | undefined;

  /** payer info **/
  payer: PublicKey;

  /** metadata info **/
  metadata: PublicKey;

  /** master edition info ie NFT token **/
  masterEdition: PublicKey;

  /** safty deposit box **/
  safetyDepositBox: PublicKey;

  /** store Id  **/
  storeId: PublicKey;

  /** vault id **/
  vaultId: PublicKey;

  /** auction id **/
  auction: PublicKey;

  /** auction token trackker **/
  auctionTokenTracker: PublicKey;

  /** safty deposit box config id **/
  safetyDepositBoxConfigId: PublicKey;
}

export interface EmptyPaymentAccountResponse {
  txId: string;
}


async function getPayoutTicket(
  auctionManager: string,
  winnerConfigIndex: number | null | undefined,
  winnerConfigItemIndex: number | null | undefined,
  creatorIndex: number | null | undefined,
  safetyDepositBox: string,
  recipient: string,
) {


  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metaplex'),
        new PublicKey(auctionManager).toBuffer(),
        Buffer.from(
          winnerConfigIndex !== null && winnerConfigIndex !== undefined
            ? winnerConfigIndex.toString()
            : 'participation',
        ),
        Buffer.from(
          winnerConfigItemIndex !== null && winnerConfigItemIndex !== undefined
            ? winnerConfigItemIndex.toString()
            : '0',
        ),
        Buffer.from(
          creatorIndex !== null && creatorIndex !== undefined
            ? creatorIndex.toString()
            : 'auctioneer',
        ),
        new PublicKey(safetyDepositBox).toBuffer(),
        new PublicKey(recipient).toBuffer(),
      ],
      new PublicKey('p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98'),
    )
  )[0];
}



/**
 * Empty winning out from escrow (Accept Payment) Account to the auction creator or NFT creator wallet .
 */
export const emptypaymentaccount = async ({
  connection,
  wallet,
  auction,
  storeId,
  destination,
  auctionManager,
  escrowAccount,
  auctionTokenTracker,
  vaultId,
  payer,
  metadata,
  safetyDepositBox,
  safetyDepositBoxConfigId,
  winningConfigIndex,
  winningConfigItemIndex,
  creatorIndex,


}: emptyAccountParams): Promise<EmptyPaymentAccountResponse> => {


  // get data for transactions


  const tx = new Transaction();

  const payoutTicket = await getPayoutTicket(auctionManager.toString(), winningConfigIndex, winningConfigItemIndex, creatorIndex, safetyDepositBox.toString(), payer.toString())


  const value = new EmptyPaymentAccountArgs({ winningConfigIndex: winningConfigIndex, winningConfigItemIndex: winningConfigItemIndex, creatorIndex: creatorIndex })

  const data = Buffer.from(serialize(EMPTY_PAYMENT_ACCOUNT, value));

  const keys = [
    {
      pubkey: escrowAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: destination,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: auctionManager,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: payoutTicket,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: payer,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: metadata,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: safetyDepositBox,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: storeId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: vaultId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: auction,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
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

    {
      pubkey: auctionTokenTracker,
      isSigner: false,
      isWritable: false,
    },

    {
      pubkey: safetyDepositBoxConfigId,
      isSigner: false,
      isWritable: false,
    },
  ];

  tx.add(new TransactionInstruction({
    keys,
    programId: new PublicKey('p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98'),
    data
  }));

  const txId = await sendTransaction({ connection, txs: [tx], wallet: wallet, options: { skipPreflight: true } });

  return { txId };
};




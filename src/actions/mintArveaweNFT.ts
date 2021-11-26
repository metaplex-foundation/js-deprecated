import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';
import { Connection } from '../Connection';
import { MetadataJson } from '../types';
import { Wallet } from '../wallet';
import { ArweaveStorage, ArweaveUploadResult } from '../providers';
import { PayForFiles } from '../programs';
import { prepareTokenAccountAndMintTx } from './shared';
import { Metadata, Creator, MetadataDataData, CreateMetadata } from '../programs/metadata';
import { sendTransaction } from './transactions';
import { updateMetadata } from './updateMetadata';
import { createMasterEdition } from './createMasterEdition';
import { config } from '../config';
import { getFileHash } from '../utils/crypto';
import {
  createFilePack,
  getFileAndMetadataCostInfo,
  METADATA_FILE_NAME,
} from '../utils/arweave-cost';

const EMPTY_URI = ' '.repeat(64);

export enum ENftProgress {
  none,
  minting,
  preparing_assets,
  signing_metadata_transaction,
  sending_transaction_to_solana,
  waiting_for_initial_confirmation,
  waiting_for_final_confirmation,
  uploading_to_arweave,
  updating_metadata,
  signing_token_transaction,
}

const ARWEAVE_WALLET = new PublicKey(config.arweaveWalletForFiles);

export interface IPayForFilesParams {
  wallet: Wallet;
  file: File;
  metadata: MetadataJson;
}

export interface IPayForFilesResult {
  files: Map<string, File>;
  payForFilesTx: PayForFiles;
}

export async function payForFiles(
  { file, metadata, wallet: w }: IPayForFilesParams,
  WebFile: typeof File = File,
): Promise<IPayForFilesResult> {
  const fileMetadata = createFilePack(metadata, METADATA_FILE_NAME, WebFile);
  const [hashFile, hashMetadata] = await Promise.all([
    getFileHash(file),
    getFileHash(fileMetadata),
  ]);
  const files = new Map<string, File>();
  files.set(file.name, file);
  files.set(fileMetadata.name, fileMetadata);

  const { lamports } = await getFileAndMetadataCostInfo(file, metadata, fileMetadata);

  const payForFilesTx = new PayForFiles(
    {
      feePayer: w.publicKey,
    },
    {
      arweaveWallet: ARWEAVE_WALLET,
      lamports,
      fileHashes: [hashFile, hashMetadata],
    },
  );

  return { payForFilesTx, files };
}

export interface MintArveaweNFTResponse {
  txId: string;
  mint: PublicKey;
  metadata: PublicKey;
  arweaveResult: ArweaveUploadResult;
}

export interface IMintArweaveParams {
  connection: Connection;
  wallet: Wallet;
  storage: ArweaveStorage;
  file: File;
  metadata: MetadataJson;
  maxSupply: number;
  updateProgress?: (status: ENftProgress) => void;
}

export async function mintArweaveNFT(
  {
    connection,
    wallet,
    file,
    metadata,
    maxSupply,
    storage,
    updateProgress = () => {},
  }: IMintArweaveParams,
  WebFile: typeof File = File,
): Promise<MintArveaweNFTResponse> {
  try {
    updateProgress(ENftProgress.minting);

    const { payForFilesTx, files } = await payForFiles(
      {
        wallet,
        file,
        metadata,
      },
      WebFile,
    );

    const { mint, createMintTx, createAssociatedTokenAccountTx, mintToTx } =
      await prepareTokenAccountAndMintTx(connection, wallet.publicKey);

    const metadataPDA = await Metadata.getPDA(mint.publicKey);

    const creators = metadata.properties.creators.map((c) => new Creator(c));
    const metadataData = new MetadataDataData({
      name: metadata.name,
      symbol: metadata.symbol,
      uri: EMPTY_URI,
      sellerFeeBasisPoints: metadata.seller_fee_basis_points,
      creators,
    });
    const createMetadataTx = new CreateMetadata(
      {
        feePayer: wallet.publicKey,
      },
      {
        metadata: metadataPDA,
        mint: mint.publicKey,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
        metadataData,
      },
    );
    updateProgress(ENftProgress.preparing_assets);

    const txid = await sendTransaction({
      connection,
      wallet,
      signers: [mint],
      txs: [
        payForFilesTx,
        createMintTx,
        createMetadataTx,
        createAssociatedTokenAccountTx,
        mintToTx,
      ],
    });

    updateProgress(ENftProgress.signing_metadata_transaction);

    await connection.confirmTransaction(txid, 'max');

    updateProgress(ENftProgress.sending_transaction_to_solana);

    // Force wait for max confirmations
    // await connection.confirmTransaction(txid, 'max');
    await connection.getParsedConfirmedTransaction(txid, 'confirmed');
    updateProgress(ENftProgress.waiting_for_initial_confirmation);

    const arweaveResult = await storage.upload(
      files as unknown as Map<string, Buffer>, // TODO: probably we need to update ArweaveStorage interface
      mint.publicKey.toBase58(),
      txid,
    );
    updateProgress(ENftProgress.waiting_for_final_confirmation);

    const metadataFile = arweaveResult.messages?.find((m) => m.filename === METADATA_FILE_NAME);

    if (metadataFile?.transactionId) {
      const metadataData = new MetadataDataData({
        name: metadata.name,
        symbol: metadata.symbol,
        uri: `https://arweave.net/${metadataFile.transactionId}`,
        creators,
        sellerFeeBasisPoints: metadata.seller_fee_basis_points,
      });

      updateProgress(ENftProgress.uploading_to_arweave);

      await updateMetadata({
        connection,
        wallet,
        editionMint: mint.publicKey,
        newMetadataData: metadataData,
        newUpdateAuthority: undefined,
      });

      updateProgress(ENftProgress.updating_metadata);

      await createMasterEdition({
        connection,
        wallet,
        editionMint: mint.publicKey,
        updateAuthority: wallet.publicKey,

        maxSupply: maxSupply ? new BN(maxSupply) : undefined,
      });

      updateProgress(ENftProgress.signing_token_transaction);
    }
    return { arweaveResult, txId: txid, mint: mint.publicKey, metadata: metadataPDA };
  } catch (err) {
    updateProgress(ENftProgress.none);
    throw err;
  }
}

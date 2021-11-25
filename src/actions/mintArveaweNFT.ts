import BN from 'bn.js';
import { calculate } from '@metaplex/arweave-cost';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import crypto from 'crypto';
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

export async function convertFile2Hash(file: File): Promise<Buffer> {
  const hashSum = crypto.createHash('sha256');
  const data = await file.text();
  hashSum.update(data);
  const hex = hashSum.digest('hex');
  return Buffer.from(hex);
}

export function getAssetCostInfo(files: Map<string, Buffer>) {
  const sizes = Array.from(files.values()).map((f) => f.byteLength);
  return calculate(sizes);
}

export function createFilePack(metadata: MetadataJson, WebFile = File): File {
  const filedata = {
    animation_url: undefined,
    attributes: metadata.attributes && metadata.attributes.length ? metadata.attributes : undefined,

    name: metadata.name,
    symbol: metadata.symbol,
    description: metadata.description,
    seller_fee_basis_points: metadata.seller_fee_basis_points,

    image: metadata.image,
    external_url: metadata.external_url,
    properties: {
      files: metadata.properties.files,
      category: metadata.properties.category,
      creators: metadata.properties.creators.map(({ address, share }) => ({
        address,
        share,
      })),
    },
  };

  return new WebFile([JSON.stringify(filedata)], 'metadata.json');
}

export async function getCostInfo(
  file: File,
  metadata: MetadataJson,
  fileMetadata = createFilePack(metadata),
) {
  const [dataFile, dataMetadata] = await Promise.all([
    file.arrayBuffer().then((d) => Buffer.from(d)),
    fileMetadata.arrayBuffer().then((d) => Buffer.from(d)),
  ]);
  const files = new Map<string, Buffer>();
  files.set(file.name, dataFile);
  files.set(fileMetadata.name, dataMetadata);
  return getAssetCostInfo(files);
}
export async function getCost(
  file: File,
  metadata: MetadataJson,
  fileMetadata = createFilePack(metadata),
) {
  const calcInfo = await getCostInfo(file, metadata, fileMetadata);
  return calcInfo.solana * LAMPORTS_PER_SOL;
}

const ARWEAVE_WALLET = new PublicKey('6FKvsq4ydWFci6nGq9ckbjYMtnmaqAoatz5c9XWjiDuS');

export async function payForFiles(
  {
    file,
    metadata,
    wallet: w,
  }: {
    wallet: Wallet;
    file: File;
    metadata: MetadataJson;
  },
  WebFile = File,
) {
  const fileMetadata = createFilePack(metadata, WebFile);
  const [hashFile, hashMetadata] = await Promise.all([
    convertFile2Hash(file),
    convertFile2Hash(fileMetadata),
  ]);
  const files = new Map<string, File>();
  files.set(file.name, file);
  files.set(fileMetadata.name, fileMetadata);

  const lamports = await getCost(file, metadata, fileMetadata);

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

export async function mintArveaweNFT(
  {
    connection,
    wallet,
    file,
    metadata,
    maxSupply,
    storage,
    progress = () => {},
  }: {
    connection: Connection;
    wallet: Wallet;
    storage: ArweaveStorage;
    file: File;
    metadata: MetadataJson;
    maxSupply: number;
    progress?: (status: ENftProgress) => void;
  },
  WebFile = File,
): Promise<MintArveaweNFTResponse> {
  try {
    progress(ENftProgress.minting);

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
      uri: ' '.repeat(64),
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
    progress(ENftProgress.preparing_assets);

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

    progress(ENftProgress.signing_metadata_transaction);

    try {
      await connection.confirmTransaction(txid, 'max');
    } catch {}
    progress(ENftProgress.sending_transaction_to_solana);

    // Force wait for max confirmations
    // await connection.confirmTransaction(txid, 'max');
    await connection.getParsedConfirmedTransaction(txid, 'confirmed');
    progress(ENftProgress.waiting_for_initial_confirmation);

    const arweaveResult = await storage.upload(
      files as unknown as Map<string, Buffer>, // TODO: probably we need to update ArweaveStorage interface
      mint.publicKey.toBase58(),
      txid,
    );
    progress(ENftProgress.waiting_for_final_confirmation);

    const metadataFile = arweaveResult.messages?.find((m) => m.filename === 'manifest.json');

    if (metadataFile?.transactionId) {
      const metadataData = new MetadataDataData({
        name: metadata.name,
        symbol: metadata.symbol,
        uri: `https://arweave.net/${metadataFile.transactionId}`,
        creators,
        sellerFeeBasisPoints: metadata.seller_fee_basis_points,
      });

      progress(ENftProgress.uploading_to_arweave);

      await updateMetadata({
        connection,
        wallet,
        editionMint: mint.publicKey,
        newMetadataData: metadataData,
        newUpdateAuthority: undefined,
      });

      progress(ENftProgress.updating_metadata);

      await createMasterEdition({
        connection,
        wallet,
        editionMint: mint.publicKey,
        updateAuthority: wallet.publicKey,

        maxSupply: maxSupply ? new BN(maxSupply) : undefined,
      });

      progress(ENftProgress.signing_token_transaction);
    }
    return { arweaveResult, txId: txid, mint: mint.publicKey, metadata: metadataPDA };
  } catch (err) {
    progress(ENftProgress.none);
    throw err;
  }
}

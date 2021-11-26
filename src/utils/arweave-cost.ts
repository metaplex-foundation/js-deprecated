import { calculate } from '@metaplex/arweave-cost';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { MetadataJson } from '../types';

export const METADATA_FILE_NAME = 'metadata.json';

export function createFilePack(
  {
    attributes,
    name,
    symbol,
    description,
    seller_fee_basis_points,
    image,
    external_url,
    properties,
  }: MetadataJson,
  filename = METADATA_FILE_NAME,
  WebFile: typeof File = File,
): File {
  const filedata = {
    animation_url: undefined,
    attributes: attributes?.length ? attributes : undefined,
    name,
    symbol,
    description,
    seller_fee_basis_points,
    image,
    external_url,
    properties: {
      ...properties,
      creators: properties.creators.map(({ address, share }) => ({
        address,
        share,
      })),
    },
  };
  return new WebFile([JSON.stringify(filedata)], filename);
}

export type InfoCalculate = ReturnType<typeof calculate> extends PromiseLike<infer T> ? T : never;

export function getAssetCostInfo(files: Map<string, Buffer>): Promise<InfoCalculate> {
  const sizes = Array.from(files.values()).map((f) => f.byteLength);
  return calculate(sizes);
}

export interface GetArweaveCostInfoResult {
  info: InfoCalculate;
  lamports: number;
}

export async function getFileAndMetadataCostInfo(
  file: File,
  metadata: MetadataJson,
  fileMetadata: File = createFilePack(metadata),
): Promise<GetArweaveCostInfoResult> {
  const [dataFile, dataMetadata] = await Promise.all([
    file.arrayBuffer().then((d) => Buffer.from(d)),
    fileMetadata.arrayBuffer().then((d) => Buffer.from(d)),
  ]);
  const files = new Map<string, Buffer>();
  files.set(file.name, dataFile);
  files.set(fileMetadata.name, dataMetadata);
  const info = await getAssetCostInfo(files);
  return { info, lamports: info.solana * LAMPORTS_PER_SOL };
}

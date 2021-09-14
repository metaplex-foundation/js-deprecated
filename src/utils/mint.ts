import { File } from '../isomorphic';
import sha256 from 'crypto-js/sha256';

// This is only necessary until this is resolved: https://github.com/node-fetch/fetch-blob/pull/119
async function text(file: File) {
  // More optimized than using this.arrayBuffer()
  // that requires twice as much ram
  const decoder = new TextDecoder('utf-8', { fatal: false });
  return decoder.decode(await file.arrayBuffer());
}

export async function getFileHash(file: File) {
  return Buffer.from(sha256(await text(file)).toString());
}

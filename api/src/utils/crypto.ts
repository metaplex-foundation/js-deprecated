import sha256 from 'crypto-js/sha256';
import { Buffer } from 'buffer';

export async function getFileHash(file: Buffer) {
  return Buffer.from(sha256(file.toString()).toString());
}

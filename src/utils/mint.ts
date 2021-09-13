import crypto from 'crypto';

export async function getFileHash(file: Uint8Array) {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(new TextDecoder('utf-8').decode(file));
  return Buffer.from(hashSum.digest('hex'));
}

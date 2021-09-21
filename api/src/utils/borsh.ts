import { PublicKey } from '@solana/web3.js';
import { deserializeUnchecked, serialize, deserialize, BinaryReader, BinaryWriter } from 'borsh';
import base58 from 'bs58';

export const extendBorsh = () => {
  (BinaryReader.prototype as any).readPubkey = function () {
    const reader = this as unknown as BinaryReader;
    const array = reader.readFixedArray(32);
    return new PublicKey(array);
  };
  (BinaryWriter.prototype as any).writePubkey = function (value: PublicKey) {
    const writer = this as unknown as BinaryWriter;
    writer.writeFixedArray(value.toBuffer());
  };
  (BinaryReader.prototype as any).readPubkeyAsString = function () {
    const reader = this as unknown as BinaryReader;
    const array = reader.readFixedArray(32);
    return base58.encode(array); // pubkey string
  };
  (BinaryWriter.prototype as any).writePubkeyAsString = function (
    value: string, // pubkey string
  ) {
    const writer = this as unknown as BinaryWriter;
    writer.writeFixedArray(base58.decode(value));
  };
};

extendBorsh();

type DataConstructor<T> = {
  readonly SCHEMA;
  new (args: any): T;
};

export class Data<T = {}> {
  constructor(args: T = {} as T) {
    Object.assign(this, args);
  }

  static struct<T>(this: DataConstructor<T>, fields: any) {
    return struct(this, fields);
  }

  static deserialize<T>(this: DataConstructor<T>, data: Buffer) {
    return deserializeUnchecked(this.SCHEMA, this, data);
  }
}

export const struct = <T>(type: any, fields: any) => {
  return new Map<any, any>([[type, { kind: 'struct', fields }]]);
};

export { deserialize, deserializeUnchecked, serialize };

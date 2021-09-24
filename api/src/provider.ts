import { Connection } from './Connection';
import { Wallet } from './wallet';

export class Provider {
  constructor(public connection: Connection, public wallet: Wallet) {}
}

let _provider: Provider = null;

export const setProvider = (provider: Provider) => {
  _provider = provider;
};

export const getProvider = (): Provider => {
  return _provider;
};

import { Connection } from './Connection';
import { Provider, setProvider } from './provider';
import { Wallet } from './wallet';

export * from './actions';

export const init = (connection: Connection, wallet: Wallet) => {
  const provider = new Provider(connection, wallet);
  setProvider(provider);
};

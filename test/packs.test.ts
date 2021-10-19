import { Connection } from '../src';
import {
  PackSet,
  PackSetState,
  PackCard,
  PackVoucher,
  DistributionType,
  ProvingProcess,
} from '../src/programs/nft-packs';
import {
  PACKSET_PUBKEY,
  PACKCARD_PUBKEY,
  PACKVOUCHER_PUBKEY,
  PROVING_PROCESS_PUBKEY,
} from './utils';

describe('Packs', () => {
  let connection: Connection;

  beforeAll(() => {
    connection = new Connection('devnet');
  });

  describe('Pack Set', () => {
    test('load', async () => {
      const packSet = await PackSet.load(connection, PACKSET_PUBKEY);

      expect(packSet.pubkey).toEqual(PACKSET_PUBKEY);
      expect(packSet.data.state).toEqual(PackSetState.Activated);
    });

    test('getCards', async () => {
      const packSet = await PackSet.load(connection, PACKSET_PUBKEY);
      const cards = await packSet.getCards(connection);

      expect(cards[0].data.packSet).toEqual(PACKSET_PUBKEY.toString());
    });
  });

  describe('Pack Card', () => {
    test('load', async () => {
      const packCard = await PackCard.load(connection, PACKCARD_PUBKEY);

      expect(packCard.pubkey).toEqual(PACKCARD_PUBKEY);
      expect(packCard.data.distribution.type).toEqual(DistributionType.FixedNumber);
    });
  });

  describe('Pack Voucer', () => {
    test('load', async () => {
      const packVoucher = await PackVoucher.load(connection, PACKVOUCHER_PUBKEY);

      expect(packVoucher.pubkey).toEqual(PACKVOUCHER_PUBKEY);
    });
  });

  describe('Proving Process', () => {
    test('load', async () => {
      const provingProcess = await ProvingProcess.load(connection, PROVING_PROCESS_PUBKEY);

      expect(provingProcess.pubkey).toEqual(PROVING_PROCESS_PUBKEY);
    });
  });
});

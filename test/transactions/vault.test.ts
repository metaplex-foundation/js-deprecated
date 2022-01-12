import {
  mockTransaction,
  serializeConfig,
  BURN_AUTHORITY_PUBKEY,
  CURRENT_AUTHORITY_PUBKEY,
  EXTERNAL_PRICE_ACCOUNT_PUBKEY,
  FRACTIONAL_MINT_PUBKEY,
  FRACTIONAL_TREASURY_PUBKEY,
  FRACTION_MINT_AUTHORITY_PUBKEY,
  FRACTION_MINT_PUBKEY,
  FRACTION_TREASURY_PUBKEY,
  NEW_AUTHORITY_PUBKEY,
  NEW_VAULT_AUTHORITY_PUBKEY,
  OUTSTANDING_SHARES_ACCOUNT_PUBKEY,
  OUTSTANDING_SHARE_TOKEN_ACCOUNT_PUBKEY,
  PAYING_TOKEN_ACCOUNT_PUBKEY,
  PRICING_LOOKUP_ADDRESS_PUBKEY,
  PROCEEDS_ACCOUNT_PUBKEY,
  REDEEM_TREASURY_PUBKEY,
  SAFETY_DEPOSIT_BOX_PUBKEY,
  SOURCE_PUBKEY,
  STORE_PUBKEY,
  TOKEN_ACCOUNT_PUBKEY,
  TOKEN_STORE_ACCOUNT_PUBKEY,
  TRANSFER_AUTHORITY_PUBKEY,
  VAULT_AUTHORITY_PUBKEY,
  VAULT_PUBKEY,
  DESTINATION_PUBKEY,
} from '../utils';
import {
  ActivateVault,
  AddSharesToTreasury,
  AddTokenToInactiveVault,
  CombineVault,
  ExternalPriceAccountData,
  InitVault,
  MintFractionalShares,
  RedeemShares,
  SetVaultAuthority,
  UpdateExternalPriceAccount,
  WithdrawSharesFromTreasury,
  WithdrawTokenFromSafetyDepositBox,
} from '@metaplex-foundation/mpl-token-vault';
import BN from 'bn.js';

describe('Vault transactions', () => {
  test('InitVault', async () => {
    const data = new InitVault(mockTransaction, {
      vault: VAULT_PUBKEY,
      vaultAuthority: VAULT_AUTHORITY_PUBKEY,
      fractionalMint: FRACTIONAL_MINT_PUBKEY,
      redeemTreasury: REDEEM_TREASURY_PUBKEY,
      fractionalTreasury: FRACTIONAL_TREASURY_PUBKEY,
      pricingLookupAddress: PRICING_LOOKUP_ADDRESS_PUBKEY,
      allowFurtherShareCreation: true,
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('ActivateVault', async () => {
    const data = new ActivateVault(mockTransaction, {
      vault: VAULT_PUBKEY,
      vaultAuthority: VAULT_AUTHORITY_PUBKEY,
      fractionMint: FRACTION_MINT_PUBKEY,
      fractionTreasury: FRACTION_TREASURY_PUBKEY,
      fractionMintAuthority: FRACTION_MINT_AUTHORITY_PUBKEY,
      numberOfShares: new BN(1),
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('AddTokenToInactiveVault', async () => {
    const data = new AddTokenToInactiveVault(mockTransaction, {
      vault: VAULT_PUBKEY,
      vaultAuthority: VAULT_AUTHORITY_PUBKEY,
      tokenAccount: TOKEN_ACCOUNT_PUBKEY,
      tokenStoreAccount: TOKEN_STORE_ACCOUNT_PUBKEY,
      transferAuthority: TRANSFER_AUTHORITY_PUBKEY,
      safetyDepositBox: SAFETY_DEPOSIT_BOX_PUBKEY,
      amount: new BN(1),
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('CombineVault', async () => {
    const data = new CombineVault(mockTransaction, {
      vault: VAULT_PUBKEY,
      vaultAuthority: VAULT_AUTHORITY_PUBKEY,
      transferAuthority: TRANSFER_AUTHORITY_PUBKEY,
      fractionMint: FRACTION_MINT_PUBKEY,
      fractionTreasury: FRACTION_TREASURY_PUBKEY,
      outstandingShareTokenAccount: OUTSTANDING_SHARE_TOKEN_ACCOUNT_PUBKEY,
      burnAuthority: BURN_AUTHORITY_PUBKEY,
      newVaultAuthority: NEW_VAULT_AUTHORITY_PUBKEY,
      externalPriceAccount: EXTERNAL_PRICE_ACCOUNT_PUBKEY,
      payingTokenAccount: PAYING_TOKEN_ACCOUNT_PUBKEY,
      redeemTreasury: REDEEM_TREASURY_PUBKEY,
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('SetVaultAuthority', async () => {
    const data = new SetVaultAuthority(mockTransaction, {
      vault: VAULT_PUBKEY,
      currentAuthority: CURRENT_AUTHORITY_PUBKEY,
      newAuthority: NEW_AUTHORITY_PUBKEY,
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('RedeemShares', async () => {
    const data = new RedeemShares(mockTransaction, {
      vault: VAULT_PUBKEY,
      burnAuthority: BURN_AUTHORITY_PUBKEY,
      fractionMint: FRACTION_MINT_PUBKEY,
      outstandingSharesAccount: OUTSTANDING_SHARES_ACCOUNT_PUBKEY,
      proceedsAccount: PROCEEDS_ACCOUNT_PUBKEY,
      redeemTreasury: REDEEM_TREASURY_PUBKEY,
      transferAuthority: TRANSFER_AUTHORITY_PUBKEY,
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('AddSharesToTreasury', async () => {
    const data = new AddSharesToTreasury(mockTransaction, {
      fractionTreasury: FRACTION_TREASURY_PUBKEY,
      source: SOURCE_PUBKEY,
      store: STORE_PUBKEY,
      transferAuthority: TRANSFER_AUTHORITY_PUBKEY,
      vault: VAULT_PUBKEY,
      vaultAuthority: VAULT_AUTHORITY_PUBKEY,
      numberOfShares: new BN(1),
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('MintFractionalShares', async () => {
    const data = new MintFractionalShares(mockTransaction, {
      fractionMint: FRACTIONAL_MINT_PUBKEY,
      fractionMintAuthority: FRACTION_MINT_AUTHORITY_PUBKEY,
      fractionTreasury: FRACTION_TREASURY_PUBKEY,
      store: STORE_PUBKEY,
      vault: VAULT_PUBKEY,
      vaultAuthority: VAULT_AUTHORITY_PUBKEY,
      numberOfShares: new BN(1),
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('UpdateExternalPriceAccount', async () => {
    const data = new UpdateExternalPriceAccount(mockTransaction, {
      externalPriceAccount: EXTERNAL_PRICE_ACCOUNT_PUBKEY,
      externalPriceAccountData: new ExternalPriceAccountData({
        allowedToCombine: false,
        priceMint: '5nxC9KnUSqr5dNQoPN7xhKfmzS48znM3zfNqcgdKYXrh',
        pricePerShare: new BN(1),
      }),
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('WithdrawSharesFromTreasury', async () => {
    const data = new WithdrawSharesFromTreasury(mockTransaction, {
      destination: DESTINATION_PUBKEY,
      fractionTreasury: FRACTION_TREASURY_PUBKEY,
      store: STORE_PUBKEY,
      transferAuthority: TRANSFER_AUTHORITY_PUBKEY,
      vault: VAULT_PUBKEY,
      vaultAuthority: VAULT_AUTHORITY_PUBKEY,
      numberOfShares: new BN(1),
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });

  test('WithdrawTokenFromSafetyDepositBox', async () => {
    const data = new WithdrawTokenFromSafetyDepositBox(mockTransaction, {
      destination: DESTINATION_PUBKEY,
      fractionMint: FRACTION_MINT_PUBKEY,
      safetyDepositBox: SAFETY_DEPOSIT_BOX_PUBKEY,
      store: STORE_PUBKEY,
      transferAuthority: TRANSFER_AUTHORITY_PUBKEY,
      vault: VAULT_PUBKEY,
      vaultAuthority: VAULT_AUTHORITY_PUBKEY,
      amount: new BN(1),
    });

    const serializedData = data.serialize(serializeConfig);
    expect(JSON.stringify(serializedData)).toMatchSnapshot();
  });
});

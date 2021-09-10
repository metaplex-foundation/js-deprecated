export enum ErrorCode {
  ERROR_INVALID_OWNER,
  ERROR_INVALID_ACCOUNT_DATA,
  ERROR_DEPRECATED_ACCOUNT_DATA,
}

export class SDKError extends Error {
  errorCode: ErrorCode;

  constructor(errorCode: ErrorCode, message: string) {
    super(message);
    this.errorCode = errorCode;
  }
}

export const ERROR_INVALID_OWNER: () => SDKError = () => {
  return new SDKError(ErrorCode.ERROR_INVALID_OWNER, 'Invalid owner');
};

export const ERROR_INVALID_ACCOUNT_DATA: () => SDKError = () => {
  return new SDKError(ErrorCode.ERROR_INVALID_ACCOUNT_DATA, 'Invalid data');
};

export const ERROR_DEPRECATED_ACCOUNT_DATA: () => SDKError = () => {
  return new SDKError(ErrorCode.ERROR_DEPRECATED_ACCOUNT_DATA, 'Account data is deprecated');
};

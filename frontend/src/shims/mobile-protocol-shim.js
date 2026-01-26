// Shim for @solana-mobile/mobile-wallet-adapter-protocol to fix build issues on web
// This package is only used on mobile devices, so we provide empty exports for web builds

export const AppIdentity = {};
export const Base64EncodedAddress = {};
export const Cluster = {};
export const AuthorizationResult = {};
export const SignedMessage = {};
export const SignedTransaction = {};

// Export all functions as no-ops
export const startRemoteScenario = () => {
  throw new Error('Mobile wallet adapter is not supported in web browsers');
};

export const transact = () => {
  throw new Error('Mobile wallet adapter is not supported in web browsers');
};

export const authorize = () => {
  throw new Error('Mobile wallet adapter is not supported in web browsers');
};

export const deauthorize = () => {
  throw new Error('Mobile wallet adapter is not supported in web browsers');
};

export const reauthorize = () => {
  throw new Error('Mobile wallet adapter is not supported in web browsers');
};

export const signTransactions = () => {
  throw new Error('Mobile wallet adapter is not supported in web browsers');
};

export const signMessages = () => {
  throw new Error('Mobile wallet adapter is not supported in web browsers');
};

export const signAndSendTransactions = () => {
  throw new Error('Mobile wallet adapter is not supported in web browsers');
};

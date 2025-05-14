export interface WalletInfo {
  privateKey: string;
  publicKey: string;
  address: string;
  mnemonic?: string;
}

export interface RpcInfo {
  name: string;
  chainId: string;
  isTestnet: boolean;
}

export interface BalanceInfo {
  eth: string;
  ctc: string;
  gcre: string;
  isLoading: boolean;
  error: string | null;
  rpcInfo: RpcInfo | null;
}

export type WalletCreationMethod = "mnemonic" | "random";

import { ethers } from "ethers";
import type { WalletInfo } from "../types/wallet";
import {
  CTC_CONTRACT,
  GCRE_CONTRACT,
  ERC20_ABI,
  RPC_ENDPOINTS,
} from "./constants";

let currentRpcIndex = 0;
let currentProvider: ethers.JsonRpcProvider | null = null;

export const getCurrentRpcInfo = async () => {
  if (currentProvider) {
    try {
      const network = await currentProvider.getNetwork();
      return {
        name: RPC_ENDPOINTS[currentRpcIndex].name,
        chainId: network.chainId.toString(),
        isTestnet: network.chainId !== 1n,
      };
    } catch {
      return null;
    }
  }
  return null;
};

const getProvider = async () => {
  if (currentProvider) {
    try {
      await currentProvider.getNetwork();
      return currentProvider;
    } catch {
      currentProvider = null;
    }
  }

  let lastError: Error | null = null;

  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    const endpoint = RPC_ENDPOINTS[i];
    try {
      const provider = new ethers.JsonRpcProvider(endpoint.url);

      await provider.getNetwork();

      currentRpcIndex = i;
      currentProvider = provider;

      return provider;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error(`${endpoint.name} 연결 실패`);
    }
  }

  throw (
    lastError ||
    new Error("모든 RPC 연결에 실패했습니다. 네트워크 연결을 확인해주세요.")
  );
};

export const createWalletFromMnemonic = async (
  mnemonic?: string
): Promise<WalletInfo> => {
  try {
    let wallet: ethers.Wallet;
    let mnemonicPhrase: string;

    if (mnemonic) {
      // 타입 단언 사용
      wallet = ethers.Wallet.fromPhrase(
        mnemonic.trim()
      ) as unknown as ethers.Wallet;
      mnemonicPhrase = mnemonic.trim();
    } else {
      const randomWallet = ethers.Wallet.createRandom();
      if (!randomWallet.mnemonic?.phrase) {
        throw new Error("니모닉 생성에 실패했습니다.");
      }
      // 타입 단언 사용
      wallet = randomWallet as unknown as ethers.Wallet;
      mnemonicPhrase = randomWallet.mnemonic.phrase;
    }

    return {
      privateKey: wallet.privateKey,
      publicKey: wallet.signingKey.publicKey,
      address: wallet.address,
      mnemonic: mnemonicPhrase,
    };
  } catch (error) {
    console.error("니모닉으로 지갑 생성 오류:", error);
    throw error instanceof Error
      ? error
      : new Error("니모닉으로 지갑을 생성하는 중 오류가 발생했습니다.");
  }
};

export const createWalletFromRandomSeed = (): WalletInfo => {
  try {
    const privateKeyBytes = ethers.randomBytes(32);
    const privateKey = ethers.hexlify(privateKeyBytes);

    const wallet = new ethers.Wallet(privateKey);

    return {
      privateKey: wallet.privateKey,
      publicKey: wallet.signingKey.publicKey,
      address: wallet.address,
    };
  } catch (error) {
    console.error("랜덤 시드로 지갑 생성 오류:", error);
    throw new Error("랜덤 시드로 지갑을 생성하는 중 오류가 발생했습니다.");
  }
};

export const getEthBalance = async (address: string): Promise<string> => {
  try {
    const provider = await getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("ETH 잔액 조회 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("ETH 잔액을 조회하는 중 오류가 발생했습니다.");
  }
};

export const getTokenBalance = async (
  address: string,
  contractAddress: string
): Promise<string> => {
  try {
    const provider = await getProvider();
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error(`토큰 잔액 조회 오류 (${contractAddress}):`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("토큰 잔액을 조회하는 중 오류가 발생했습니다.");
  }
};

export const getCtcBalance = async (address: string): Promise<string> => {
  return getTokenBalance(address, CTC_CONTRACT);
};

export const getGcreBalance = async (address: string): Promise<string> => {
  return getTokenBalance(address, GCRE_CONTRACT);
};

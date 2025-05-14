import { useState, useCallback, useEffect } from "react";
import type {
  WalletInfo,
  BalanceInfo,
  WalletCreationMethod,
} from "../types/wallet";
import {
  createWalletFromMnemonic,
  createWalletFromRandomSeed,
  getEthBalance,
  getCtcBalance,
  getGcreBalance,
  getCurrentRpcInfo,
} from "../utils/wallet";

export const useWallet = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>({
    eth: "0",
    ctc: "0",
    gcre: "0",
    isLoading: false,
    error: null,
    rpcInfo: null,
  });

  const createWallet = useCallback(
    async (method: WalletCreationMethod, mnemonic?: string) => {
      try {
        let newWallet: WalletInfo;

        if (method === "mnemonic") {
          newWallet = await createWalletFromMnemonic(mnemonic);
        } else {
          newWallet = createWalletFromRandomSeed();
        }

        setWalletInfo(newWallet);
        return newWallet;
      } catch (error) {
        console.error("지갑 생성 오류:", error);
        throw error;
      }
    },
    []
  );

  const fetchBalances = useCallback(async (address: string) => {
    if (!address) return;

    setBalanceInfo((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [eth, ctc, gcre, rpcInfo] = await Promise.all([
        getEthBalance(address),
        getCtcBalance(address),
        getGcreBalance(address),
        getCurrentRpcInfo(),
      ]);

      setBalanceInfo({
        eth,
        ctc,
        gcre,
        isLoading: false,
        error: null,
        rpcInfo,
      });
    } catch (error) {
      console.error("잔액 조회 오류:", error);
      setBalanceInfo((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "잔액 조회 중 오류가 발생했습니다.",
        rpcInfo: null,
      }));
    }
  }, []);

  useEffect(() => {
    if (walletInfo?.address) {
      fetchBalances(walletInfo.address);
    }
  }, [walletInfo?.address, fetchBalances]);

  return {
    walletInfo,
    setWalletInfo,
    balanceInfo,
    createWallet,
    fetchBalances,
  };
};

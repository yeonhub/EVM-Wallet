import { useState } from "react";
import WalletCreator from "./components/WalletCreator";
import WalletInfo from "./components/WalletInfo";
import { useWallet } from "./hooks/useWallet";
import type { WalletCreationMethod } from "./types/wallet";
import "./App.scss";

function App() {
  const {
    walletInfo,
    setWalletInfo,
    balanceInfo,
    createWallet,
    fetchBalances,
  } = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWallet = async (
    method: WalletCreationMethod,
    mnemonic?: string
  ) => {
    setIsCreating(true);
    try {
      await createWallet(method, mnemonic);
    } catch (error) {
      alert(
        "지갑 생성 중 오류가 발생했습니다: " +
          (error instanceof Error ? error.message : "알 수 없는 오류")
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefreshBalance = () => {
    if (walletInfo?.address) {
      fetchBalances(walletInfo.address);
    }
  };

  const handleResetWallet = () => {
    setWalletInfo(null);
  };

  return (
    <div className="wallet-app">
      <header>
        <h1>EVM Wallet</h1>
        <p>ETH, CTC-EVM, GCRE</p>
      </header>

      <section className="wallet-section">
        {!walletInfo ? (
          <WalletCreator
            onCreateWallet={handleCreateWallet}
            isLoading={isCreating}
          />
        ) : (
          <WalletInfo
            walletInfo={walletInfo}
            balanceInfo={balanceInfo}
            onRefreshBalance={handleRefreshBalance}
            onResetWallet={handleResetWallet}
          />
        )}
      </section>
    </div>
  );
}

export default App;

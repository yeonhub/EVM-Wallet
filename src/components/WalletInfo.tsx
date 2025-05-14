import { useState } from "react";
import type {
  WalletInfo as WalletInfoType,
  BalanceInfo,
} from "../types/wallet";
import "../styles/WalletInfo.scss";

interface WalletInfoProps {
  walletInfo: WalletInfoType;
  balanceInfo: BalanceInfo;
  onRefreshBalance: () => void;
  onResetWallet: () => void;
}

const WalletInfo: React.FC<WalletInfoProps> = ({
  walletInfo,
  balanceInfo,
  onRefreshBalance,
  onResetWallet,
}) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  const { privateKey, publicKey, address, mnemonic } = walletInfo;
  const { eth, ctc, gcre, isLoading, error } = balanceInfo;

  const togglePrivateKey = () => {
    setShowPrivateKey(!showPrivateKey);
  };

  const toggleMnemonic = () => {
    setShowMnemonic(!showMnemonic);
  };

  const handleCreateNewWallet = () => {
    const confirmed = window.confirm(
      "현재 지갑의 정보가 모두 삭제됩니다. 계속하시겠습니까?"
    );
    if (confirmed) {
      onResetWallet();
    }
  };

  const maskingDots = "•".repeat(
    privateKey.startsWith("0x") ? privateKey.length - 2 : privateKey.length
  );

  return (
    <div className="wallet-info">
      <div className="info-container">
        <div className="key-info">
          <div className="info-item">
            <h3>Address - 지갑 주소</h3>
            <div className="value-container">
              <p className="value">{address}</p>
              <button
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(address)}
              >
                복사
              </button>
            </div>
          </div>

          <div className="info-item">
            <h3>Public Key - 공개키</h3>
            <div className="value-container">
              <p className="value">{publicKey}</p>
              <button
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(publicKey)}
              >
                복사
              </button>
            </div>
          </div>

          <div className="info-item">
            <h3>Private Key - 개인키</h3>
            <div className="value-container">
              <div className="private-key-container">
                <div
                  className="private-key masked-key"
                  style={{ opacity: showPrivateKey ? 0 : 1 }}
                >
                  {maskingDots}
                </div>
                <div
                  className="private-key actual-key"
                  style={{ opacity: showPrivateKey ? 1 : 0 }}
                >
                  {privateKey}
                </div>
              </div>
              <button className="view-button" onClick={togglePrivateKey}>
                {showPrivateKey ? "숨기기" : "보기"}
              </button>
              <button
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(privateKey)}
              >
                복사
              </button>
            </div>
          </div>

          {mnemonic && (
            <div className="info-item">
              <h3>Mnemonic - 니모닉</h3>
              <div className="value-container">
                <div className="private-key-container">
                  <div
                    className="private-key masked-key"
                    style={{
                      opacity: showMnemonic ? 0 : 1,
                      pointerEvents: showMnemonic ? "none" : "auto",
                    }}
                  >
                    {maskingDots}
                  </div>
                  <div
                    className="private-key actual-key"
                    style={{
                      opacity: showMnemonic ? 1 : 0,
                      pointerEvents: showMnemonic ? "auto" : "none",
                    }}
                  >
                    {mnemonic}
                  </div>
                </div>
                <button className="view-button" onClick={toggleMnemonic}>
                  {showMnemonic ? "숨기기" : "보기"}
                </button>
                <button
                  className="copy-button"
                  onClick={() => navigator.clipboard.writeText(mnemonic)}
                >
                  복사
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="balance-info">
          <h3>Balance</h3>
          {error ? (
            <div className="network-error">
              <p className="error">{error}</p>
              <p className="error-help">
                네트워크 연결을 확인하시고 다시 시도해주세요.
              </p>
            </div>
          ) : (
            <div className="balances">
              <div className="balance-item">
                <span className="token-name">ETH</span>
                <span className="amount">
                  {isLoading ? "잔액 조회 중" : eth}
                </span>
              </div>
              <div className="balance-item">
                <span className="token-name">CTC (EVM)</span>
                <span className="amount">
                  {isLoading ? "잔액 조회 중" : ctc}
                </span>
              </div>
              <div className="balance-item">
                <span className="token-name">GCRE</span>
                <span className="amount">
                  {isLoading ? "잔액 조회 중" : gcre}
                </span>
              </div>
            </div>
          )}
          <button
            className="refresh-button"
            onClick={onRefreshBalance}
            disabled={isLoading}
          >
            {isLoading ? "잔액 조회 중" : "새로고침"}
          </button>

          <button className="new-wallet-button" onClick={handleCreateNewWallet}>
            새 지갑 생성하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;

import { useState, useEffect } from "react";
import type { WalletCreationMethod } from "../types/wallet";
import {
  MnemonicValidator,
  type MnemonicValidationResult,
} from "../utils/mnemonicValidator";
import "../styles/WalletCreator.scss";

interface WalletCreatorProps {
  onCreateWallet: (method: WalletCreationMethod, mnemonic?: string) => void;
  isLoading: boolean;
}

const WalletCreator: React.FC<WalletCreatorProps> = ({
  onCreateWallet,
  isLoading,
}) => {
  const [selectedMethod, setSelectedMethod] =
    useState<WalletCreationMethod>("random");
  const [mnemonic, setMnemonic] = useState("");
  const [showMnemonic, setShowMnemonic] = useState(true);
  const [validation, setValidation] = useState<MnemonicValidationResult | null>(
    null
  );
  const [touched, setTouched] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSpaceIndex, setLastSpaceIndex] = useState(-1);

  const handleMnemonicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;

    const lowerCased = input.toLowerCase();

    const currentSpaceIndex = input.lastIndexOf(" ");
    const hasNewSpace = currentSpaceIndex !== lastSpaceIndex;

    if (hasNewSpace) {
      setLastSpaceIndex(currentSpaceIndex);
      setIsTyping(false);
    } else {
      setIsTyping(true);
    }

    if (/\s{2,}/.test(input)) {
      const normalized = lowerCased.replace(/\s{2,}/g, " ");

      const selectionStart = e.target.selectionStart || 0;
      const selectionEnd = e.target.selectionEnd || 0;

      const lengthDiff = input.length - normalized.length;
      const newSelectionStart = Math.max(0, selectionStart - lengthDiff);
      const newSelectionEnd = Math.max(0, selectionEnd - lengthDiff);

      setMnemonic(normalized);

      setTimeout(() => {
        if (e.target) {
          e.target.selectionStart = newSelectionStart;
          e.target.selectionEnd = newSelectionEnd;
        }
      }, 0);
    } else {
      setMnemonic(lowerCased);
    }

    if (!touched) {
      setTouched(true);
    }
  };

  const handleMnemonicBlur = () => {
    setIsTyping(false);
  };

  useEffect(() => {
    if (mnemonic.trim() && touched && selectedMethod === "mnemonic") {
      const validationResult = MnemonicValidator.validateMnemonic(
        mnemonic,
        isTyping
      );
      setValidation(validationResult);
    } else {
      setValidation(null);
    }
  }, [mnemonic, touched, selectedMethod, isTyping]);

  const toggleMnemonicVisibility = () => {
    setShowMnemonic(!showMnemonic);
  };

  const handleCreateWallet = () => {
    if (
      selectedMethod === "mnemonic" &&
      !mnemonic.trim() &&
      !confirm(
        "니모닉이 입력되지 않았습니다. 랜덤 니모닉을 생성하시겠습니까?"
      )
    ) {
      return;
    }

    onCreateWallet(selectedMethod, mnemonic.trim() || undefined);
  };

  const isCreateButtonDisabled =
    isLoading ||
    (selectedMethod === "mnemonic" &&
      touched &&
      mnemonic.trim() &&
      !validation?.isValid);

  return (
    <div className="wallet-creator">
      <h2>Create Wallet</h2>

      <div className="creation-methods">
        <div className="method-option">
          <input
            type="radio"
            id="random"
            name="creation-method"
            checked={selectedMethod === "random"}
            onChange={() => setSelectedMethod("random")}
          />
          <label htmlFor="random">랜덤 시드로 생성</label>
        </div>

        <div className="method-option">
          <input
            type="radio"
            id="mnemonic"
            name="creation-method"
            checked={selectedMethod === "mnemonic"}
            onChange={() => setSelectedMethod("mnemonic")}
          />
          <label htmlFor="mnemonic">니모닉으로 생성</label>
        </div>
      </div>

      {selectedMethod === "mnemonic" && (
        <div className="mnemonic-input">
          <label htmlFor="mnemonic-phrase">니모닉 구문 (선택사항)</label>
          <div className="mnemonic-container">
            <textarea
              id="mnemonic-phrase"
              placeholder="12, 15, 18, 21, 24개 단어 중 하나를 입력하세요 (공백으로 구분)"
              value={mnemonic}
              onChange={handleMnemonicChange}
              onBlur={handleMnemonicBlur}
              rows={3}
              style={{
                WebkitTextSecurity: showMnemonic ? "none" : "disc",
              }}
              className={
                validation && !validation.isValid && touched ? "error" : ""
              }
            />
            <button
              type="button"
              className="view-button"
              onClick={toggleMnemonicVisibility}
            >
              {showMnemonic ? "숨기기" : "보기"}
            </button>
          </div>

          {validation && touched && (
            <div className="validation-feedback">
              <div className="word-count">
                <span>
                  단어 수: {validation.wordCount}
                  {MnemonicValidator.VALID_WORD_COUNTS.includes(
                    validation.wordCount
                  )
                    ? " ✓"
                    : ` (필요: ${validation.expectedWordCount.join(", ")})`}
                </span>
              </div>

              {validation.errorMessages.length > 0 && (
                <div className="error-messages">
                  {validation.errorMessages.map((error, index) => (
                    <p key={index} className="error-message">
                      {error}
                    </p>
                  ))}
                </div>
              )}

              {validation.wordCount > 0 &&
                validation.invalidWords.length === 0 &&
                !validation.hasCorrectChecksum && (
                  <div className="checksum-explanation">
                    <p>
                      💡 <strong>체크섬 오류란?</strong>
                    </p>
                    <p>
                      BIP-39 니모닉에서 마지막 단어는 앞 단어들의 체크섬 역할을
                      합니다. 유효한 단어 조합이라도 체크섬이 맞지 않으면 지갑을
                      복구할 수 없습니다.
                    </p>
                  </div>
                )}

              {validation.isValid && (
                <div className="success-message">
                  <p>✅ 유효한 니모닉 문구입니다.</p>
                </div>
              )}
            </div>
          )}

          <p className="hint">
            니모닉을 입력하지 않으면 자동으로 12개 단어가 생성됩니다.
          </p>
        </div>
      )}

      <button
        className="create-button"
        onClick={handleCreateWallet}
        disabled={isCreateButtonDisabled}
      >
        {isLoading ? "처리 중..." : "지갑 생성하기"}
      </button>
    </div>
  );
};

export default WalletCreator;

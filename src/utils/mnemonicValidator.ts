import { ethers } from "ethers";
import englishWordlist from "../assets/bip-0039/english.json";

export interface MnemonicValidationResult {
  isValid: boolean;
  wordCount: number;
  expectedWordCount: number[];
  invalidWords: string[];
  hasCorrectChecksum: boolean;
  errorMessages: string[];
}

export class MnemonicValidator {
  public static readonly VALID_WORD_COUNTS = [12, 15, 18, 21, 24];
  private static readonly WORDLIST = new Set(
    (englishWordlist as { words: string[] }).words
  );

  static validateMnemonic(
    input: string,
    isTyping: boolean = false
  ): MnemonicValidationResult {
    const result: MnemonicValidationResult = {
      isValid: false,
      wordCount: 0,
      expectedWordCount: this.VALID_WORD_COUNTS,
      invalidWords: [],
      hasCorrectChecksum: false,
      errorMessages: [],
    };

    if (!input || !input.trim()) {
      result.errorMessages.push("니모닉을 입력해주세요.");
      return result;
    }

    const normalized = input
      .toLowerCase()
      .trim()
      .replace(/\s{2,}/g, " ");

    const words = normalized.split(" ");
    result.wordCount = words.length;

    if (!this.VALID_WORD_COUNTS.includes(words.length)) {
      result.errorMessages.push(
        `니모닉은 ${this.VALID_WORD_COUNTS.join(
          ", "
        )}개 단어 중 하나여야 합니다. 현재 ${words.length}개 단어가 있습니다.`
      );
    }

    let wordsToCheck = words;
    if (isTyping && !input.endsWith(" ")) {
      wordsToCheck = words.slice(0, -1);
    }

    result.invalidWords = wordsToCheck.filter(
      (word) => !this.WORDLIST.has(word)
    );
    if (result.invalidWords.length > 0) {
      result.errorMessages.push(
        `유효하지 않은 단어가 포함되어 있습니다: ${result.invalidWords.join(
          ", "
        )}`
      );
    }

    if (
      this.VALID_WORD_COUNTS.includes(words.length) &&
      result.invalidWords.length === 0
    ) {
      try {
        ethers.HDNodeWallet.fromPhrase(normalized);
        result.hasCorrectChecksum = true;
      } catch (error) {
        result.hasCorrectChecksum = false;
        if (error instanceof Error && error.message.includes("checksum")) {
          result.errorMessages.push("니모닉 체크섬이 유효하지 않습니다.");
        }
      }
    }

    result.isValid =
      this.VALID_WORD_COUNTS.includes(words.length) &&
      result.invalidWords.length === 0 &&
      result.hasCorrectChecksum;

    return result;
  }

  static normalizeMnemonic(input: string): string {
    return input
      .toLowerCase()
      .replace(/\s{2,}/g, " ")
      .trim();
  }
}

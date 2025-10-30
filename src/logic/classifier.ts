const BASE_ALPHABET = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."0123456789",
  " ",
  ".",
  ",",
  "'",
  "-",
  "?",
  "!",
  ":",
  ";",
  '"',
  "(",
  ")",
  "/",
  "_",
  "@",
  "&",
] as const;

const COMMON_SUBSTITUTIONS: Record<string, string> = {
  "\t": " ",
  "\n": " ",
  "\r": " ",
  "\u00A0": " ", // non-breaking space
  "\u1680": " ",
  "\u2000": " ",
  "\u2001": " ",
  "\u2002": " ",
  "\u2003": " ",
  "\u2004": " ",
  "\u2005": " ",
  "\u2006": " ",
  "\u2007": " ",
  "\u2008": " ",
  "\u2009": " ",
  "\u200A": " ",
  "\u202F": " ",
  "\u205F": " ",
  "\u3000": " ",
  "\u2018": "'",
  "\u2019": "'",
  "\u201A": "'",
  "\u2032": "'",
  "\u02BC": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u201E": '"',
  "\u2033": '"',
  "\u02DD": '"',
  "\u2013": "-",
  "\u2014": "-",
  "\u2015": "-",
  "\u2212": "-",
  "\u2043": "-",
  "\u2026": "...",
  "\u00B7": ".",
  "\u2022": ".",
  "\u2044": "/",
  "\u2215": "/",
  "\u204E": "*",
  "\u00D7": "X",
  "\u2715": "X",
  "\u2716": "X",
  "\u00F7": "/",
};

const COMBINING_MARKS_REGEX = /\p{Mark}+/gu;

export type SanitizationAction = "kept" | "normalized" | "replaced" | "removed";

export interface SanitizationChange {
  original: string;
  replacement: string;
  index: number;
  action: SanitizationAction;
  reason?: string;
}

export interface SanitizationResult {
  value: string;
  /** Only non-trivial transformations are recorded to keep memory usage low. */
  changes: SanitizationChange[];
}

const ALLOWED_CHARACTERS = new Set(BASE_ALPHABET);

function isSupportedCharacter(char: string): boolean {
  return ALLOWED_CHARACTERS.has(char);
}

function stripCombiningMarks(text: string): string {
  return text.replace(COMBINING_MARKS_REGEX, "");
}

function substituteCharacter(char: string): string | undefined {
  return COMMON_SUBSTITUTIONS[char];
}

function replaceNonAsciiLetters(char: string): string | undefined {
  if (/^[A-Z]$/.test(char)) {
    return char;
  }

  const ascii = char.normalize("NFKD");
  const withoutMarks = stripCombiningMarks(ascii);
  if (/^[A-Z]+$/.test(withoutMarks) && withoutMarks.length > 0) {
    return withoutMarks;
  }

  return undefined;
}

function fallbackReplacement(char: string): string {
  if (/^[0-9]$/.test(char)) {
    return char;
  }

  return "?";
}

/**
 * Convert arbitrary text into the 52-character alphabet supported by the Solitaire cipher.
 * The function normalizes Unicode input, substitutes common punctuation variants,
 * and reports the actions taken for each non-trivial change.
 *
 * The `changes` array only records characters that were transformed, which
 * keeps memory usage predictable even when processing ≈100k characters.
 */
export function sanitizeToCipherAlphabet(input: string): SanitizationResult {
  const changes: SanitizationChange[] = [];
  const resultBuilder: string[] = [];

  const normalizedInput = stripCombiningMarks(input.normalize("NFKD")).toUpperCase();

  for (let index = 0; index < normalizedInput.length; index += 1) {
    const originalChar = normalizedInput[index];

    if (isSupportedCharacter(originalChar)) {
      resultBuilder.push(originalChar);
      continue;
    }

    const substitution = substituteCharacter(originalChar);
    if (substitution !== undefined) {
      const substitutionUpper = stripCombiningMarks(substitution.normalize("NFKD")).toUpperCase();
      const filtered = Array.from(substitutionUpper)
        .map((char) => {
          if (isSupportedCharacter(char)) {
            return char;
          }
          const ascii = replaceNonAsciiLetters(char);
          if (ascii) {
            return ascii;
          }
          return fallbackReplacement(char);
        })
        .join("");
      resultBuilder.push(filtered);
      changes.push({
        original: originalChar,
        replacement: filtered,
        index,
        action: "replaced",
        reason: "substitution",
      });
      continue;
    }

    const asciiLetters = replaceNonAsciiLetters(originalChar);
    if (asciiLetters !== undefined) {
      resultBuilder.push(asciiLetters);
      changes.push({
        original: originalChar,
        replacement: asciiLetters,
        index,
        action: "normalized",
        reason: "ascii-folding",
      });
      continue;
    }

    if (/^\s$/.test(originalChar)) {
      resultBuilder.push(" ");
      changes.push({
        original: originalChar,
        replacement: " ",
        index,
        action: "replaced",
        reason: "whitespace",
      });
      continue;
    }

    const fallback = fallbackReplacement(originalChar);
    resultBuilder.push(fallback);
    changes.push({
      original: originalChar,
      replacement: fallback,
      index,
      action: "replaced",
      reason: "fallback",
    });
  }

  return { value: resultBuilder.join(""), changes };
}

export const CIPHER_ALPHABET = BASE_ALPHABET.join("");

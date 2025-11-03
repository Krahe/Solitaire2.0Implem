import type { Deck } from "./deck";
import { assertDeckPermutation, validateDeckPermutation } from "./deckValidation";

/**
 * Core constants
 */
const CARD_COUNT = 54;
const CARD_COUNT_BIGINT = BigInt(CARD_COUNT);

// Alphabet for encoding the permutation index into a user-shareable code.
// This is a 62-character alphabet: 0-9 A-Z a-z
export const DECK_CODE_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" as const;
const DECK_CODE_BASE = BigInt(DECK_CODE_ALPHABET.length);

/**
 * factorialBigInt(n): bigint factorial.
 * Used to compute how many possible permutations exist (54!)
 */
function factorialBigInt(n: bigint): bigint {
  if (n < 0n) {
    throw new Error("Factorial is undefined for negative integers.");
  }

  let result = 1n;
  for (let i = 2n; i <= n; i += 1n) {
    result *= i;
  }
  return result;
}

/**
 * MAX_INDEX is the highest legal index any 54-card deck permutation can map to.
 * There are 54! possible decks. We index them [0 .. 54!-1].
 */
export const MAX_INDEX = factorialBigInt(CARD_COUNT_BIGINT) - 1n;

/**
 * FACTORIAL_TABLE[i] = i! as bigint, precomputed so we don't recalc factorials in loops.
 * Index i corresponds to i! for i in [0..54].
 * NOTE: table[0] = 1n, table[1] = 1n, table[2] = 2n, etc.
 */
const FACTORIAL_TABLE: bigint[] = (() => {
  const table: bigint[] = [1n];
  for (let i = 1; i <= CARD_COUNT; i += 1) {
    table[i] = table[i - 1] * BigInt(i);
  }
  return table;
})();

/**
 * deckToIndex(deck):
 * Convert a validated permutation of [1..54] into a single bigint index
 * via factorial number system / Lehmer code.
 */
function deckToIndex(deck: Deck): bigint {
  if (deck.length !== CARD_COUNT) {
    throw new Error(`Deck must contain exactly ${CARD_COUNT} cards.`);
  }

  // We'll mutate a working list of remaining cards.
  const remainingCards = Array.from({ length: CARD_COUNT }, (_, i) => i + 1);

  let indexValue = 0n;

  for (let position = 0; position < CARD_COUNT; position += 1) {
    const card = deck[position];
    const cardIndex = remainingCards.indexOf(card);

    if (cardIndex === -1) {
      throw new Error(`Card ${card} is not available in the deck state.`);
    }

    // factorial for how many permutations remain after this position
    const factorial = FACTORIAL_TABLE[CARD_COUNT - 1 - position];

    indexValue += BigInt(cardIndex) * factorial;

    // remove that card from future consideration
    remainingCards.splice(cardIndex, 1);
  }

  return indexValue;
}

/**
 * indexToDeck(value):
 * Convert a bigint index back into the unique deck permutation [1..54].
 * Throws if the index is outside legal [0 .. MAX_INDEX].
 */
function indexToDeck(value: bigint): Deck {
  if (value < 0n || value > MAX_INDEX) {
    throw new Error("Deck index is out of range.");
  }

  const remainingCards = Array.from({ length: CARD_COUNT }, (_, i) => i + 1);
  const deck: number[] = [];
  let remainder = value;

  for (let remaining = CARD_COUNT; remaining >= 1; remaining -= 1) {
    const factorial = FACTORIAL_TABLE[remaining - 1];
    const digit = remainder / factorial;
    remainder = remainder % factorial;

    const selectionIndex = Number(digit);
    const selectedCard = remainingCards[selectionIndex];

    if (selectedCard === undefined) {
      throw new Error("Decoded deck contains an invalid card index.");
    }

    deck.push(selectedCard);
    remainingCards.splice(selectionIndex, 1);
  }

  return deck;
}

/**
 * encodeIndexToCode(value):
 * Encode the bigint index into our custom base-N alphabet (0-9A-Za-z).
 * This is what the user actually copies / pastes / stashes in a talisman.
 */
function encodeIndexToCode(value: bigint): string {
  if (value < 0n) {
    throw new Error("Cannot encode negative indices.");
  }

  if (value === 0n) {
    return DECK_CODE_ALPHABET[0];
  }

  let encoded = "";
  let remainder = value;

  while (remainder > 0n) {
    const digit = remainder % DECK_CODE_BASE;
    remainder /= DECK_CODE_BASE;
    encoded = `${DECK_CODE_ALPHABET[Number(digit)]}${encoded}`;
  }

  return encoded;
}

/**
 * decodeCodeToIndex(code):
 * Convert the deck code string (base-62 style) back into a bigint index.
 */
function decodeCodeToIndex(code: string): bigint {
  const trimmed = code.trim();
  if (trimmed.length === 0) {
    throw new Error("Deck code cannot be empty.");
  }

  let value = 0n;

  for (const char of trimmed) {
    const digitIndex = DECK_CODE_ALPHABET.indexOf(char);
    if (digitIndex === -1) {
      throw new Error(`Invalid character "${char}" in deck code.`);
    }

    value = value * DECK_CODE_BASE + BigInt(digitIndex);
  }

  return value;
}

/**
 * deckToCode(deck):
 * - Validate it's a legal 54-card permutation (unique 1..54, jokers present, etc.)
 *   using validateDeckPermutation for nice human-readable messages.
 * - Map that permutation to bigint index.
 * - Encode that bigint index into our short code string.
 *
 * Throws if invalid (so we do not "bless" garbage with an official-looking code).
 */
export function deckToCode(deck: Deck): string {
  const validationError = validateDeckPermutation(deck);
  if (validationError) {
    throw new Error(`Invalid deck vector: ${validationError}`);
  }

  const index = deckToIndex(deck);
  return encodeIndexToCode(index);
}

/**
 * codeToDeck(code):
 * - Decode the string code back into a bigint.
 * - Reject codes past MAX_INDEX (outside 54! space).
 * - Convert bigint → deck permutation.
 * - Sanity-check with assertDeckPermutation for safety.
 */
export function codeToDeck(code: string): Deck {
  const index = decodeCodeToIndex(code);
  if (index > MAX_INDEX) {
    throw new Error("Deck code is out of range for a 54-card deck.");
  }

  const deck = indexToDeck(index);

  // Final guard: make sure we actually reconstructed a legal deck
  assertDeckPermutation(deck);

  return deck;
}

/* -------------------------------------------------
 * Fingerprinting / identity
 * -------------------------------------------------
 *
 * deckFingerprint(deck) is async and environment-aware:
 *   - Prefer Web Crypto API (globalThis.crypto.subtle.digest("SHA-256"))
 *   - Fallback to Node's crypto.createHash("sha256")
 *   - If neither exists, throw loudly
 *
 * We assert that the deck is valid before hashing,
 * so we never assign a "holy sigil" to nonsense.
 */

const NO_CRYPTO_SUPPORT_MESSAGE =
  "Unable to compute deck fingerprint: no Web Crypto API (crypto.subtle) or Node crypto.createHash available.";

/**
 * Try to grab a SubtleCrypto from browser/worker-like environments.
 * Returns null if not available.
 */
function getSubtleCrypto(): SubtleCrypto | null {
  if (typeof globalThis === "undefined") {
    return null;
  }

  const globalWithCrypto = globalThis as typeof globalThis & {
    crypto?: Crypto & { subtle?: SubtleCrypto };
    msCrypto?: Crypto & { subtle?: SubtleCrypto };
  };

  const cryptoApi = globalWithCrypto.crypto ?? globalWithCrypto.msCrypto;
  if (!cryptoApi || typeof cryptoApi.subtle?.digest !== "function") {
    return null;
  }

  return cryptoApi.subtle;
}

/**
 * Compute a hex SHA-256 hash of a UTF-8 payload string.
 * - Browser path: crypto.subtle.digest
 * - Node path: crypto.createHash("sha256")
 * - Else: throw (no silent downgrade)
 */
async function sha256Hex(payload: string): Promise<string> {
  const subtle = getSubtleCrypto();
  if (subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const digest = await subtle.digest("SHA-256", data);
    const hashBytes = new Uint8Array(digest);
    return Array.from(hashBytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  }

  // Node fallback
  try {
    const nodeCrypto = await import(
      /* @vite-ignore */ /* webpackIgnore: true */ ("node:crypto" as string),
    );
    if (typeof nodeCrypto.createHash !== "function") {
      throw new Error("createHash is not available");
    }

    return nodeCrypto
      .createHash("sha256")
      .update(payload, "utf8")
      .digest("hex");
  } catch (error) {
    try {
      const nodeCryptoFallback = await import(
        /* @vite-ignore */ /* webpackIgnore: true */ ("crypto" as string),
      );
      if (typeof nodeCryptoFallback.createHash !== "function") {
        throw new Error("createHash is not available");
      }

      return nodeCryptoFallback
        .createHash("sha256")
        .update(payload, "utf8")
        .digest("hex");
    } catch (fallbackError) {
      throw new Error(NO_CRYPTO_SUPPORT_MESSAGE, {
        cause:
          fallbackError instanceof Error
            ? fallbackError
            : error instanceof Error
              ? error
              : undefined,
      });
    }
  }
}

/**
 * Deterministic deck serialization.
 * We hash "1,2,3,...,54", not raw memory layout.
 */
function serializeDeck(deck: Deck): string {
  return deck.join(",");
}

/**
 * deckFingerprint(deck):
 * - Assert it's a valid deck first (no nonsense gets blessed).
 * - Return async hex SHA-256 digest (64 hex chars).
 */
export async function deckFingerprint(deck: Deck): Promise<string> {
  assertDeckPermutation(deck);
  return sha256Hex(serializeDeck(deck));
}

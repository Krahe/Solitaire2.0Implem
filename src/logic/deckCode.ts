import type { Deck } from "./deck";
import { assertDeckPermutation, validateDeckPermutation } from "./deckValidation";

/**
 * Card → code and code → card helpers
 * We encode each card (1–54) in base36, fixed width.
 */
const CARD_CHARS = 2;
const CARD_RADIX = 36;
const TOTAL_LENGTH = 54 * CARD_CHARS;

/**
 * Turn a single numeric card ID (1–54) into a 2-char base36 chunk, e.g. "0A".
 */
function encodeCard(card: number): string {
  return card.toString(CARD_RADIX).toUpperCase().padStart(CARD_CHARS, "0");
}

/**
 * Parse a 2-char base36 chunk like "0A" back into a number.
 */
function decodeCard(chunk: string): number {
  return Number.parseInt(chunk, CARD_RADIX);
}

/**
 * Strip whitespace / punctuation and normalize to uppercase [0-9A-Z].
 * This lets users paste messy codes with spaces or dashes.
 */
function sanitizeCode(code: string): string {
  return code.replace(/[^0-9A-Z]/gi, "").toUpperCase();
}

/**
 * Convert a validated deck vector into its compact code string.
 * Throws if the deck is not a legal 54-card permutation.
 */
export function deckToCode(deck: Deck): string {
  const validationError = validateDeckPermutation(deck);
  if (validationError) {
    throw new Error(`Invalid deck vector: ${validationError}`);
  }

  return deck.map(encodeCard).join("");
}

/**
 * Convert a code string back into a deck vector.
 * - Normalizes formatting (sanitizeCode)
 * - Enforces expected total length
 * - Verifies the resulting deck is a legal permutation (unique 1–54 incl. both jokers)
 */
export function codeToDeck(code: string): Deck {
  const sanitized = sanitizeCode(code);
  if (sanitized.length === 0) {
    throw new Error("Deck code cannot be empty.");
  }

  if (sanitized.length !== TOTAL_LENGTH) {
    throw new Error(
      `Deck code must contain ${TOTAL_LENGTH} characters after formatting.`
    );
  }

  const deck: number[] = [];
  for (let index = 0; index < sanitized.length; index += CARD_CHARS) {
    const chunk = sanitized.slice(index, index + CARD_CHARS);
    const value = decodeCard(chunk);

    if (Number.isNaN(value)) {
      throw new Error(
        `Deck code contains invalid characters in chunk "${chunk}".`
      );
    }

    deck.push(value);
  }

  const validationError = validateDeckPermutation(deck);
  if (validationError) {
    throw new Error(`Deck code expands to an invalid deck: ${validationError}`);
  }

  return deck;
}

/* ---------------------------
 * Fingerprinting / identity
 * ---------------------------
 *
 * We expose deckFingerprint(deck) as async and environment-aware:
 * - Prefer Web Crypto API (globalThis.crypto.subtle.digest("SHA-256"))
 * - Fallback to Node's crypto.createHash("sha256")
 * - If neither is available, throw loudly (no silent downgrade)
 *
 * We assert the deck is a valid permutation before hashing so we never
 * "bless" garbage with an official fingerprint.
 */

const NO_CRYPTO_SUPPORT_MESSAGE =
  "Unable to compute deck fingerprint: no Web Crypto API (crypto.subtle) or Node crypto.createHash available.";

/**
 * Try to grab a SubtleCrypto instance from the runtime (browser, secure worker, etc.).
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
 * Compute a hex SHA-256 digest of a UTF-8 payload string.
 * Prefers Web Crypto, falls back to Node crypto, throws if neither.
 */
async function sha256Hex(payload: string): Promise<string> {
  const subtle = getSubtleCrypto();
  if (subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const digest = await subtle.digest("SHA-256", data);
    const hashBytes = new Uint8Array(digest);
    return Array.from(
      hashBytes,
      (byte) => byte.toString(16).padStart(2, "0")
    ).join("");
  }

  // Node fallback
  try {
    const nodeCrypto: typeof import("node:crypto") = await import("node:crypto");

    if (typeof nodeCrypto.createHash !== "function") {
      throw new Error("createHash is not available");
    }

    return nodeCrypto
      .createHash("sha256")
      .update(payload, "utf8")
      .digest("hex");
  } catch (error) {
    throw new Error(NO_CRYPTO_SUPPORT_MESSAGE, {
      cause: error instanceof Error ? error : undefined,
    });
  }
}

/**
 * Serialize a deck in a deterministic, human-stable way before hashing.
 * (We don't hash raw memory; we hash an intentional representation.)
 *
 * Example: "1,2,3,...,54"
 */
function serializeDeck(deck: Deck): string {
  return deck.join(",");
}

/**
 * Produce a stable, async SHA-256 fingerprint for a *valid* deck.
 * - This is used for integrity (chain-of-custody) and user-facing "sigils".
 * - Throws if the deck isn't a legal permutation so we don't bless nonsense.
 */
export async function deckFingerprint(deck: Deck): Promise<string> {
  // Refuse to hash illegal decks. Keeps the covenant honest.
  assertDeckPermutation(deck);

  return sha256Hex(serializeDeck(deck));
}

import type { Deck } from "./deck";
import { assertDeckPermutation, validateDeckPermutation } from "./deckValidation";

const CARD_CHARS = 2;
const CARD_RADIX = 36;
const TOTAL_LENGTH = 54 * CARD_CHARS;
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function encodeCard(card: number): string {
  return card.toString(CARD_RADIX).toUpperCase().padStart(CARD_CHARS, "0");
}

function decodeCard(chunk: string): number {
  return Number.parseInt(chunk, CARD_RADIX);
}

function sanitizeCode(code: string): string {
  return code.replace(/[^0-9A-Z]/gi, "").toUpperCase();
}

export function deckToCode(deck: Deck): string {
  const validationError = validateDeckPermutation(deck);
  if (validationError) {
    throw new Error(`Invalid deck vector: ${validationError}`);
  }

  return deck.map(encodeCard).join("");
}

export function codeToDeck(code: string): Deck {
  const sanitized = sanitizeCode(code);
  if (sanitized.length === 0) {
    throw new Error("Deck code cannot be empty.");
  }

  if (sanitized.length !== TOTAL_LENGTH) {
    throw new Error(`Deck code must contain ${TOTAL_LENGTH} characters after formatting.`);
  }

  const deck: number[] = [];
  for (let index = 0; index < sanitized.length; index += CARD_CHARS) {
    const chunk = sanitized.slice(index, index + CARD_CHARS);
    const value = decodeCard(chunk);
    if (Number.isNaN(value)) {
      throw new Error(`Deck code contains invalid characters in chunk "${chunk}".`);
    }
    deck.push(value);
  }

  const validationError = validateDeckPermutation(deck);
  if (validationError) {
    throw new Error(`Deck code expands to an invalid deck: ${validationError}`);
  }

  return deck;
}

export function deckFingerprint(deck: Deck): string {
  assertDeckPermutation(deck);

  let hash = FNV_OFFSET_BASIS;
  for (const card of deck) {
    hash ^= card & 0xff;
    hash = Math.imul(hash, FNV_PRIME);
    hash >>>= 0;
  }

  return hash.toString(16).toUpperCase().padStart(8, "0");
}

import type { Deck } from "./deck";

const CARD_COUNT = 54;
const CARD_COUNT_BIGINT = BigInt(CARD_COUNT);
const MIN_CARD = 1;
const MAX_CARD = CARD_COUNT;

const DECK_CODE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" as const;
const DECK_CODE_BASE = BigInt(DECK_CODE_ALPHABET.length);

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

export const MAX_INDEX = factorialBigInt(CARD_COUNT_BIGINT) - 1n;

const FACTORIAL_TABLE: bigint[] = (() => {
  const table: bigint[] = [1n];
  for (let i = 1; i <= CARD_COUNT; i += 1) {
    table[i] = table[i - 1] * BigInt(i);
  }
  return table;
})();

function assertDeckVector(deck: Deck): void {
  if (deck.length !== CARD_COUNT) {
    throw new Error(`Deck must contain exactly ${CARD_COUNT} cards.`);
  }

  const seen = new Set<number>();
  for (const card of deck) {
    if (!Number.isInteger(card) || card < MIN_CARD || card > MAX_CARD) {
      throw new Error(`Card values must be integers between ${MIN_CARD} and ${MAX_CARD}.`);
    }
    if (seen.has(card)) {
      throw new Error(`Deck contains duplicate card ${card}.`);
    }
    seen.add(card);
  }
}

function deckToIndex(deck: Deck): bigint {
  const remainingCards = Array.from({ length: CARD_COUNT }, (_, index) => index + 1);
  let indexValue = 0n;

  for (let position = 0; position < CARD_COUNT; position += 1) {
    const card = deck[position];
    const cardIndex = remainingCards.indexOf(card);

    if (cardIndex === -1) {
      throw new Error(`Card ${card} is not available in the deck state.`);
    }

    const factorial = FACTORIAL_TABLE[CARD_COUNT - 1 - position];
    indexValue += BigInt(cardIndex) * factorial;
    remainingCards.splice(cardIndex, 1);
  }

  return indexValue;
}

function indexToDeck(value: bigint): Deck {
  if (value < 0n || value > MAX_INDEX) {
    throw new Error("Deck index is out of range.");
  }

  const remainingCards = Array.from({ length: CARD_COUNT }, (_, index) => index + 1);
  const deck: number[] = [];
  let remainder = value;

  for (let remaining = CARD_COUNT; remaining >= 1; remaining -= 1) {
    const factorial = FACTORIAL_TABLE[remaining - 1];
    const digit = remainder / factorial;
    remainder %= factorial;

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

export function deckToCode(deck: Deck): string {
  assertDeckVector(deck);
  const index = deckToIndex(deck);
  return encodeIndexToCode(index);
}

export function codeToDeck(code: string): Deck {
  const index = decodeCodeToIndex(code);
  if (index > MAX_INDEX) {
    throw new Error("Deck code is out of range for a 54-card deck.");
  }
  return indexToDeck(index);
}

export { DECK_CODE_ALPHABET };

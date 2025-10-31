import type { Deck } from "./deck";

function cardLabel(card: number): string {
  if (card === 53) {
    return "A";
  }
  if (card === 54) {
    return "B";
  }
  return card.toString();
}

export function validateDeckPermutation(deck: readonly number[]): string | null {
  if (!Array.isArray(deck)) {
    return "Deck must be an array of card values.";
  }

  if (deck.length !== 54) {
    return `Expected 54 cards, received ${deck.length}.`;
  }

  const hasJokerA = deck.includes(53);
  const hasJokerB = deck.includes(54);
  if (!hasJokerA || !hasJokerB) {
    return "Deck must include exactly one A joker and one B joker.";
  }

  const seen = new Set<number>();

  for (const card of deck) {
    if (!Number.isInteger(card)) {
      return `Card ${card} must be an integer between 1 and 54.`;
    }

    if (card < 1 || card > 54) {
      return `Card ${card} must be between 1 and 54.`;
    }

    if (seen.has(card)) {
      return `Card ${cardLabel(card)} appears more than once.`;
    }

    seen.add(card);
  }

  return null;
}

export function assertDeckPermutation(deck: readonly number[]): asserts deck is Deck {
  const error = validateDeckPermutation(deck);
  if (error) {
    throw new Error(error);
  }
}

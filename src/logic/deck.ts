export type Card = number;
export type Deck = Card[];

const DECK_SIZE = 54;

/**
 * Build an ordered Solitaire deck represented as numbers 1 through 54.
 * The conventional mapping is:
 *  - 1-52 for the standard playing cards (A♣ through K♦)
 *  - 53 for Joker A
 *  - 54 for Joker B
 */
export function createOrderedDeck(): Deck {
  return Array.from({ length: DECK_SIZE }, (_, index) => index + 1);
}

export interface ShuffleOptions {
  /**
   * Custom random number generator that returns values in [0, 1).
   * Useful for deterministic testing.
   */
  random?: () => number;
}

function fisherYatesShuffle(deck: Deck, random: () => number): Deck {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Generate a shuffled 54-card Solitaire deck.
 *
 * @param options Optional configuration (e.g., deterministic RNG for tests).
 * @returns A new deck vector containing each card 1-54 exactly once.
 */
export function shuffleDeck(options: ShuffleOptions = {}): Deck {
  const { random = Math.random } = options;
  return fisherYatesShuffle(createOrderedDeck(), random);
}

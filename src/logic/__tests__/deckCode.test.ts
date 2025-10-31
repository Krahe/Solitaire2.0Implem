import { describe, expect, it } from "vitest";

import { deckToCode, codeToDeck, deckFingerprint } from "../deckCode";
import { createOrderedDeck } from "../deck";

function makeInvalidDeck(): number[] {
  return [...createOrderedDeck()];
}

describe("deckCode", () => {
  it("round-trips a valid deck", () => {
    const deck = createOrderedDeck();
    const code = deckToCode(deck);

    expect(code).toHaveLength(108);
    expect(codeToDeck(code)).toEqual(deck);
    expect(deckFingerprint(deck)).toMatch(/^[0-9A-F]{8}$/);
  });

  it("rejects decks with duplicate cards", () => {
    const deck = makeInvalidDeck();
    deck[1] = deck[0];

    expect(() => deckToCode(deck)).toThrow(/appears more than once/);
  });

  it("rejects decks missing either joker", () => {
    const deck = makeInvalidDeck();
    deck.pop();
    deck.push(52);

    expect(() => deckToCode(deck)).toThrow(/joker/i);
  });

  it("rejects decks containing out-of-range values", () => {
    const deck = makeInvalidDeck();
    deck[0] = 0;

    expect(() => deckToCode(deck)).toThrow(/between 1 and 54/);
  });
});

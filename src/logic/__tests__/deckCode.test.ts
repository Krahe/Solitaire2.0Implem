import { describe, expect, it } from "vitest";

import {
  deckToCode,
  codeToDeck,
  deckFingerprint,
  DECK_CODE_ALPHABET,
  MAX_INDEX,
} from "../deckCode";

import { createOrderedDeck } from "../deck";

/**
 * Helper for boundary test:
 * Encode an arbitrary bigint using the same alphabet
 * the production code uses (DECK_CODE_ALPHABET),
 * so we can fabricate overflow codes.
 */
function encodeIndex(index: bigint): string {
  if (index < 0n) {
    throw new Error("Cannot encode negative values for tests.");
  }

  const base = BigInt(DECK_CODE_ALPHABET.length);

  if (index === 0n) {
    return DECK_CODE_ALPHABET[0];
  }

  let value = index;
  let result = "";

  while (value > 0n) {
    const digit = value % base;
    value /= base;
    result = `${DECK_CODE_ALPHABET[Number(digit)]}${result}`;
  }

  return result;
}

describe("deckCode round-trip + validation", () => {
  it("round-trips a valid ascending deck and fingerprints it", async () => {
    const deck = createOrderedDeck(); // e.g. [1,2,3,...,54]

    const code = deckToCode(deck);
    const decoded = codeToDeck(code);

    // round-trip must be perfect
    expect(decoded).toEqual(deck);

    // fingerprint should be a 64-char hex SHA-256
    const fp = await deckFingerprint(deck);
    expect(fp).toMatch(/^[0-9a-f]{64}$/i);
  });

  it("rejects decks with duplicate cards", () => {
    const bad = createOrderedDeck();
    bad[1] = bad[0]; // force a duplicate

    expect(() => deckToCode(bad)).toThrow(/appears more than once/i);
  });

  it("rejects decks missing either joker", () => {
    const bad = createOrderedDeck();
    // remove last card and duplicate an existing non-joker
    bad.pop();
    bad.push(52);

    expect(() => deckToCode(bad)).toThrow(/joker/i);
  });

  it("rejects decks containing out-of-range values", () => {
    const bad = createOrderedDeck();
    bad[0] = 0; // illegal

    expect(() => deckToCode(bad)).toThrow(/between 1 and 54/i);
  });
});

describe("codeToDeck boundaries", () => {
  it("accepts the maximal valid deck code (descending deck maps to MAX_INDEX)", () => {
    // descending should correspond to the highest permutation index
    const descendingDeck = Array.from({ length: 54 }, (_, i) => 54 - i);

    const maxCode = deckToCode(descendingDeck);

    // codeToDeck must be able to read it back
    expect(codeToDeck(maxCode)).toEqual(descendingDeck);
  });

  it("rejects codes that decode beyond the maximum deck index", () => {
    const overflowCode = encodeIndex(MAX_INDEX + 1n);

    expect(() => codeToDeck(overflowCode)).toThrow(/out of range/i);
  });
});

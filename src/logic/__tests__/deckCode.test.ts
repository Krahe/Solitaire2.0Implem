import { describe, expect, it } from "vitest";

import { codeToDeck, deckToCode, DECK_CODE_ALPHABET, MAX_INDEX } from "../deckCode";

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

describe("codeToDeck boundaries", () => {
  it("accepts the maximal valid deck code", () => {
    const descendingDeck = Array.from({ length: 54 }, (_, index) => 54 - index);
    const maxCode = deckToCode(descendingDeck);
    expect(codeToDeck(maxCode)).toEqual(descendingDeck);
  });

  it("rejects codes that decode beyond the maximum deck index", () => {
    const overflowCode = encodeIndex(MAX_INDEX + 1n);
    expect(() => codeToDeck(overflowCode)).toThrowError(
      /out of range for a 54-card deck/i,
    );
  });
});

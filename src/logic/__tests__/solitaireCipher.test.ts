/// <reference types="vitest" />

import { describe, expect, it } from "vitest";

import { encrypt, moveCardDown, performSolitaireRound } from "../solitaireCipher";
import { createOrderedDeck } from "../deck";

const JOKER_A = 53;
const JOKER_B = 54;

describe("moveCardDown", () => {
  it("moves Joker A one step when in the middle of the deck", () => {
    const deck = [1, JOKER_A, 2, 3, 4];
    expect(moveCardDown(deck, JOKER_A, 1)).toEqual([1, 2, JOKER_A, 3, 4]);
  });

  it("wraps Joker A from the bottom to the second position", () => {
    const deck = [1, 2, 3, JOKER_A];
    expect(moveCardDown(deck, JOKER_A, 1)).toEqual([1, JOKER_A, 2, 3]);
  });

  it("wraps Joker B two steps when starting at the bottom", () => {
    const deck = [1, 2, 3, JOKER_B];
    expect(moveCardDown(deck, JOKER_B, 2)).toEqual([1, 2, JOKER_B, 3]);
  });

  it("moves Joker B two steps from the top without wrapping", () => {
    const deck = [JOKER_B, 1, 2, 3, 4];
    expect(moveCardDown(deck, JOKER_B, 2)).toEqual([1, 2, JOKER_B, 3, 4]);
  });
});

describe("performSolitaireRound", () => {
  it("matches the first keystream value from an ordered deck", () => {
    const ordered = createOrderedDeck();
    const { deck, output } = performSolitaireRound(ordered);
    expect(output).toBe(4);
    expect(deck.length).toBe(ordered.length);
  });
});

describe("encrypt warnings", () => {
  it("flags continued runs when the caller reuses a keystream", () => {
    const ordered = createOrderedDeck();
    const result = encrypt("AAAA", ordered, { continuedFromPreviousRun: true });
    expect(result.warning).toEqual({ reusedKeystream: true });
  });
});

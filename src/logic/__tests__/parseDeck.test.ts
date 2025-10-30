import { describe, expect, it } from "vitest";
import { parseDeckVector } from "../parseDeck";
import { createOrderedDeck } from "../deck";

const orderedDeckString = createOrderedDeck().join(", ");

describe("parseDeckVector", () => {
  it("parses an ordered deck vector", () => {
    const result = parseDeckVector(orderedDeckString);

    expect(result.ok).toBe(true);
    expect(result.deck).toEqual(createOrderedDeck());
    expect(result.error).toBeNull();
  });

  it("accepts jokers expressed as letters or numbers", () => {
    const tokens = [
      ...Array.from({ length: 26 }, (_, index) => (index + 1).toString()),
      "A",
      ...Array.from({ length: 26 }, (_, index) => (index + 27).toString()),
      "b",
    ];

    const input = tokens.join(" ");
    const result = parseDeckVector(input);
    const expected = [
      ...Array.from({ length: 26 }, (_, index) => index + 1),
      53,
      ...Array.from({ length: 26 }, (_, index) => index + 27),
      54,
    ];

    expect(result.ok).toBe(true);
    expect(result.deck).toEqual(expected);
  });

  it("rejects duplicate cards", () => {
    const duplicateDeck = createOrderedDeck();
    duplicateDeck[5] = duplicateDeck[6];

    const result = parseDeckVector(duplicateDeck.join(", "));

    expect(result.ok).toBe(false);
    expect(result.deck).toBeNull();
    expect(result.error).toMatch(/appears more than once/);
  });

  it("rejects vectors with the wrong card count", () => {
    const result = parseDeckVector("1, 2, 3");

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Expected 54 cards/);
  });
});

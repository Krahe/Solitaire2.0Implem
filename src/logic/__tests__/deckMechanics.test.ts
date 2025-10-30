/// <reference types="vitest" />

import { describe, expect, it } from "vitest";

import { advanceDeckOneStep, moveCardDown } from "../solitaireCipher";
import { createOrderedDeck } from "../deck";

const JOKER_A = 53;
const JOKER_B = 54;

type Deck = number[];

function repositionCard(deck: Deck, card: number, targetIndex: number): Deck {
  const working = [...deck];
  const currentIndex = working.indexOf(card);
  if (currentIndex === -1) {
    throw new Error(`Card ${card} is not present in the deck.`);
  }
  const [value] = working.splice(currentIndex, 1);
  working.splice(targetIndex, 0, value);
  return working;
}

function manualTripleCut(deck: Deck): Deck {
  const firstJokerIndex = Math.min(deck.indexOf(JOKER_A), deck.indexOf(JOKER_B));
  const secondJokerIndex = Math.max(deck.indexOf(JOKER_A), deck.indexOf(JOKER_B));

  const top = deck.slice(0, firstJokerIndex);
  const middle = deck.slice(firstJokerIndex, secondJokerIndex + 1);
  const bottom = deck.slice(secondJokerIndex + 1);

  return [...bottom, ...middle, ...top];
}

function manualCountCut(deck: Deck): Deck {
  const bottomCard = deck[deck.length - 1];
  const cutValue = bottomCard >= JOKER_A ? JOKER_A : bottomCard;

  if (cutValue === deck.length - 1) {
    return deck;
  }

  const top = deck.slice(0, cutValue);
  const middle = deck.slice(cutValue, deck.length - 1);
  const bottom = deck[deck.length - 1];

  return [...middle, ...top, bottom];
}

describe("moveCardDown wraparound", () => {
  it.each([
    {
      description: "Joker A moves from the bottom to the second card",
      buildDeck: () => {
        const ordered = createOrderedDeck();
        const withoutJokerA = ordered.filter((card) => card !== JOKER_A);
        return [...withoutJokerA, JOKER_A];
      },
      card: JOKER_A,
      steps: 1,
      expected: () => [
        1,
        JOKER_A,
        ...Array.from({ length: 51 }, (_, index) => index + 2),
        JOKER_B,
      ],
    },
    {
      description: "Joker B wraps from the last card to the third position",
      buildDeck: () => createOrderedDeck(),
      card: JOKER_B,
      steps: 2,
      expected: () => [
        1,
        2,
        JOKER_B,
        ...Array.from({ length: 49 }, (_, index) => index + 3),
        52,
        JOKER_A,
      ],
    },
    {
      description: "Joker B starting second-to-last wraps to the second position",
      buildDeck: () => {
        let deck = createOrderedDeck();
        deck = repositionCard(deck, JOKER_B, deck.length - 2);
        return deck;
      },
      card: JOKER_B,
      steps: 2,
      expected: () => [
        1,
        JOKER_B,
        ...Array.from({ length: 51 }, (_, index) => index + 2),
        JOKER_A,
      ],
    },
  ])("$description", ({ buildDeck, card, steps, expected }) => {
    const deck = buildDeck();
    const result = moveCardDown(deck, card, steps);
    expect(result).toEqual(expected());
    expect(result.length).toBe(deck.length);
  });
});

describe("advanceDeckOneStep triple cut", () => {
  it.each([
    {
      description: "joker starts at the top of the deck",
      buildDeck: () => {
        let deck = createOrderedDeck();
        deck = repositionCard(deck, JOKER_A, 0);
        deck = repositionCard(deck, JOKER_B, 10);
        return deck;
      },
    },
    {
      description: "jokers sit squarely in the middle",
      buildDeck: () => {
        let deck = createOrderedDeck();
        deck = repositionCard(deck, JOKER_A, 20);
        deck = repositionCard(deck, JOKER_B, 32);
        return deck;
      },
    },
    {
      description: "joker pair nests near the bottom",
      buildDeck: () => {
        let deck = createOrderedDeck();
        deck = repositionCard(deck, JOKER_A, 40);
        deck = repositionCard(deck, JOKER_B, 45);
        return deck;
      },
    },
  ])("$description", ({ buildDeck }) => {
    const deck = buildDeck();
    const afterJokerA = moveCardDown(deck, JOKER_A, 1);
    const afterJokerB = moveCardDown(afterJokerA, JOKER_B, 2);
    const firstJokerIndex = Math.min(
      afterJokerB.indexOf(JOKER_A),
      afterJokerB.indexOf(JOKER_B),
    );
    const secondJokerIndex = Math.max(
      afterJokerB.indexOf(JOKER_A),
      afterJokerB.indexOf(JOKER_B),
    );

    const topSegment = afterJokerB.slice(0, firstJokerIndex);
    const middleSegment = afterJokerB.slice(firstJokerIndex, secondJokerIndex + 1);
    const bottomSegment = afterJokerB.slice(secondJokerIndex + 1);

    const expectedAfterTripleCut = manualTripleCut(afterJokerB);
    const expected = manualCountCut(expectedAfterTripleCut);
    const result = advanceDeckOneStep(deck);

    expect(result).toEqual(expected);
    expect(result.length).toBe(deck.length);

    expect(expectedAfterTripleCut.slice(0, bottomSegment.length)).toEqual(bottomSegment);
    expect(
      expectedAfterTripleCut.slice(
        bottomSegment.length,
        bottomSegment.length + middleSegment.length,
      ),
    ).toEqual(middleSegment);
    expect(expectedAfterTripleCut.slice(-topSegment.length)).toEqual(topSegment);
  });
});

describe("advanceDeckOneStep count cut", () => {
  it.each([
    {
      description: "bottom joker leaves the deck unchanged after the cut",
      buildDeck: () => {
        let deck = createOrderedDeck();
        deck = repositionCard(deck, JOKER_A, 10);
        deck = repositionCard(deck, JOKER_B, deck.length - 1);
        return deck;
      },
    },
    {
      description: "high-value bottom card cuts the appropriate number of cards",
      buildDeck: () => {
        let deck = createOrderedDeck();
        deck = repositionCard(deck, 52, deck.length - 1);
        deck = repositionCard(deck, JOKER_A, 5);
        deck = repositionCard(deck, JOKER_B, 15);
        return deck;
      },
    },
  ])("$description", ({ buildDeck }) => {
    const deck = buildDeck();
    const afterJokerA = moveCardDown(deck, JOKER_A, 1);
    const afterJokerB = moveCardDown(afterJokerA, JOKER_B, 2);
    const afterTripleCut = manualTripleCut(afterJokerB);
    const expected = manualCountCut(afterTripleCut);
    const result = advanceDeckOneStep(deck);

    expect(result).toEqual(expected);
    expect(result.length).toBe(deck.length);

    const bottomCard = afterTripleCut[afterTripleCut.length - 1];
    if (bottomCard >= JOKER_A) {
      expect(result).toEqual(afterTripleCut);
    } else {
      const cutValue = bottomCard;
      const topSegment = afterTripleCut.slice(0, cutValue);
      const middleSegment = afterTripleCut.slice(cutValue, afterTripleCut.length - 1);
      expect(result.slice(0, middleSegment.length)).toEqual(middleSegment);
      expect(result.slice(middleSegment.length, middleSegment.length + topSegment.length)).toEqual(
        topSegment,
      );
      expect(result[result.length - 1]).toBe(bottomCard);
    }
  });
});


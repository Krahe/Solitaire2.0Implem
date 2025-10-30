import type { Deck } from "./deck";
import { CIPHER_ALPHABET } from "./classifier";

const JOKER_A = 53;
const JOKER_B = 54;
const MODULUS = CIPHER_ALPHABET.length;

const charToValue = new Map<string, number>(
  Array.from(CIPHER_ALPHABET).map((char, index) => [char, index + 1]),
);

const valueToChar = Array.from(CIPHER_ALPHABET);

function moveCardDown(deck: Deck, card: number, steps: number): Deck {
  let working = [...deck];
  for (let step = 0; step < steps; step += 1) {
    const index = working.indexOf(card);
    const nextIndex = (index + 1) % working.length;
    working = [...working.slice(0, index), ...working.slice(index + 1)];
    working.splice(nextIndex, 0, card);
  }
  return working;
}

function tripleCut(deck: Deck): Deck {
  const firstJokerIndex = Math.min(deck.indexOf(JOKER_A), deck.indexOf(JOKER_B));
  const secondJokerIndex = Math.max(deck.indexOf(JOKER_A), deck.indexOf(JOKER_B));

  const top = deck.slice(0, firstJokerIndex);
  const middle = deck.slice(firstJokerIndex, secondJokerIndex + 1);
  const bottom = deck.slice(secondJokerIndex + 1);

  return [...bottom, ...middle, ...top];
}

function countCut(deck: Deck): Deck {
  const bottomCard = deck[deck.length - 1];
  const cutValue = bottomCard >= JOKER_A ? JOKER_A : bottomCard;

  if (cutValue === deck.length - 1) {
    // Cutting all but the bottom card would yield the same deck; skip work.
    return deck;
  }

  const top = deck.slice(0, cutValue);
  const middle = deck.slice(cutValue, deck.length - 1);
  const bottom = deck[deck.length - 1];

  return [...middle, ...top, bottom];
}

function outputCardValue(deck: Deck): number | null {
  const topCard = deck[0];
  const lookupIndex = (topCard >= JOKER_A ? JOKER_A : topCard);
  const card = deck[lookupIndex];
  if (card === JOKER_A || card === JOKER_B) {
    return null;
  }
  return card;
}

export function performSolitaireRound(deck: Deck): { deck: Deck; output: number | null } {
  let working = moveCardDown(deck, JOKER_A, 1);
  working = moveCardDown(working, JOKER_B, 2);
  working = tripleCut(working);
  working = countCut(working);
  const output = outputCardValue(working);
  return { deck: working, output };
}

export function generateKeystream(initialDeck: Deck, length: number): { deck: Deck; keystream: number[] } {
  const keystream: number[] = [];
  let workingDeck = [...initialDeck];

  while (keystream.length < length) {
    const { deck, output } = performSolitaireRound(workingDeck);
    workingDeck = deck;
    if (output !== null) {
      keystream.push(output % MODULUS || MODULUS);
    }
  }

  return { deck: workingDeck, keystream };
}

function textToValues(text: string): number[] {
  return Array.from(text).map((char) => {
    const value = charToValue.get(char);
    if (!value) {
      throw new Error(`Character "${char}" is not in the cipher alphabet.`);
    }
    return value;
  });
}

function valuesToText(values: number[]): string {
  return values.map((value) => valueToChar[(value - 1) % MODULUS]).join("");
}

export interface CipherResult {
  output: string;
  keystream: number[];
  finalDeck: Deck;
}

export function encrypt(text: string, deck: Deck): CipherResult {
  const values = textToValues(text);
  const { deck: finalDeck, keystream } = generateKeystream(deck, values.length);
  const encryptedValues = values.map((value, index) => {
    const ks = keystream[index];
    return ((value + ks - 1) % MODULUS) + 1;
  });
  return {
    output: valuesToText(encryptedValues),
    keystream,
    finalDeck,
  };
}

export function decrypt(text: string, deck: Deck): CipherResult {
  const values = textToValues(text);
  const { deck: finalDeck, keystream } = generateKeystream(deck, values.length);
  const decryptedValues = values.map((value, index) => {
    const ks = keystream[index];
    return ((value - ks + MODULUS - 1) % MODULUS) + 1;
  });
  return {
    output: valuesToText(decryptedValues),
    keystream,
    finalDeck,
  };
}

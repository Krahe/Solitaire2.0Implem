/// <reference types="vitest" />

import { describe, expect, it } from "vitest";

import {
  advanceDeckOneStep,
  decrypt,
  encrypt,
  generateKeystream,
} from "../solitaireCipher";
import { createOrderedDeck } from "../deck";

describe("cipher core integration", () => {
  it("round-trips representative plaintext samples", () => {
    // These shapes mirror the variety of symbols players enter during play sessions.
    // If any of them stop round-tripping, it means the cipher can't faithfully encode
    // everyday table-talk and would break the experience.
    const samples = [
      "HELLOWORLD",
      "NUMBERS12345",
      "MEET AT 0900!",
      "CAN-THIS,WORK?",
    ];

    for (const plaintext of samples) {
      const deck = createOrderedDeck();
      const encrypted = encrypt(plaintext, deck);
      const decrypted = decrypt(encrypted.output, deck);

      expect(encrypted.keystream).toHaveLength(plaintext.length);
      expect(decrypted.output).toBe(plaintext);
      expect(decrypted.finalDeck).toEqual(encrypted.finalDeck);
    }
  });

  it("replays deterministically from an identical starting state", () => {
    // Consistency ensures two groups running the same scenario with the same
    // deck log will share identical transcripts—a huge boon for community puzzles.
    const text = "CONSISTENCY";
    const referenceDeck = createOrderedDeck();
    const firstStep = advanceDeckOneStep(referenceDeck);
    const replayStep = advanceDeckOneStep(createOrderedDeck());
    expect(replayStep).toEqual(firstStep);

    const firstRun = encrypt(text, createOrderedDeck());
    const replayRun = encrypt(text, createOrderedDeck());
    expect(replayRun.output).toBe(firstRun.output);
    expect(replayRun.keystream).toEqual(firstRun.keystream);
    expect(replayRun.finalDeck).toEqual(firstRun.finalDeck);
  });

  it("exhibits avalanche behavior when swapping two cards", () => {
    // The solitaire cipher should magnify tiny deck tweaks; otherwise a player could
    // predict outcomes too easily. We expect most keystream values to diverge here.
    const baselineDeck = createOrderedDeck();
    const perturbedDeck = createOrderedDeck();
    [perturbedDeck[0], perturbedDeck[1]] = [perturbedDeck[1], perturbedDeck[0]];

    const length = 64;
    const baselineStream = generateKeystream(baselineDeck, length);
    const perturbedStream = generateKeystream(perturbedDeck, length);

    let differences = 0;
    for (let index = 0; index < length; index += 1) {
      if (baselineStream.keystream[index] !== perturbedStream.keystream[index]) {
        differences += 1;
      }
    }
    const ratio = differences / length;

    expect(perturbedStream.keystream).not.toEqual(baselineStream.keystream);
    expect(ratio).toBeGreaterThan(0.6);
  });

  it("raises a warning when callers continue a prior keystream", () => {
    // Reusing a keystream is a classic cryptographic pitfall; this flag powers
    // UI copy that coaches players away from that mistake mid-campaign.
    const deck = createOrderedDeck();
    const result = encrypt("AAAA", deck, { continuedFromPreviousRun: true });

    expect(result.warning).toEqual({ reusedKeystream: true });
  });

  it("handles empty plaintext without advancing the deck", () => {
    // Empty inputs pop up in UI drafts and should behave like a no-op so players
    // never lose sync just because they cleared a field.
    const deck = createOrderedDeck();
    const encrypted = encrypt("", deck);
    const decrypted = decrypt("", deck);

    expect(encrypted.output).toBe("");
    expect(encrypted.keystream).toEqual([]);
    expect(encrypted.finalDeck).toEqual(deck);
    expect(decrypted.output).toBe("");
    expect(decrypted.finalDeck).toEqual(deck);
  });

  it("processes long plaintexts quickly", () => {
    // Campaign logs can stretch into thousands of characters; this ensures we
    // retain performance headroom for marathon puzzle nights.
    const longText = "A".repeat(1_000);
    const deck = createOrderedDeck();
    const encrypted = encrypt(longText, deck);
    const decrypted = decrypt(encrypted.output, deck);

    expect(encrypted.output).toHaveLength(longText.length);
    expect(encrypted.keystream).toHaveLength(longText.length);
    expect(encrypted.finalDeck).toHaveLength(deck.length);
    expect(decrypted.output).toBe(longText);
  });
});

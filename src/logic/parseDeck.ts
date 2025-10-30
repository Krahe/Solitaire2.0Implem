import type { Deck } from "./deck";

export interface ParseResult {
  ok: boolean;
  deck: Deck | null;
  error: string | null;
}

function normalizeToken(token: string): string {
  return token.replace(/[^\w]/g, "").trim();
}

function parseToken(token: string): number | null {
  const normalized = normalizeToken(token);
  if (normalized.length === 0) {
    return null;
  }

  if (/^A$/i.test(normalized)) {
    return 53;
  }

  if (/^B$/i.test(normalized)) {
    return 54;
  }

  if (/^\d+$/.test(normalized)) {
    const value = Number.parseInt(normalized, 10);
    if (value >= 1 && value <= 52) {
      return value;
    }
    if (value === 53 || value === 54) {
      return value;
    }
  }

  return null;
}

function cleanTokens(tokens: string[]): string[] {
  return tokens
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

export function parseDeckVector(input: string): ParseResult {
  const rawTokens = cleanTokens(
    input
      .replace(/\[/g, " ")
      .replace(/\]/g, " ")
      .replace(/\(/g, " ")
      .replace(/\)/g, " ")
      .split(/[\s,]+/),
  );

  if (rawTokens.length === 0) {
    return {
      ok: false,
      deck: null,
      error: "Paste a 54-card vector to continue.",
    };
  }

  if (rawTokens.length !== 54) {
    return {
      ok: false,
      deck: null,
      error: `Expected 54 cards, received ${rawTokens.length}.`,
    };
  }

  const deck: number[] = [];
  const seen = new Set<number>();

  for (const token of rawTokens) {
    const parsed = parseToken(token);
    if (parsed === null) {
      return {
        ok: false,
        deck: null,
        error: `Unrecognized token "${token}". Use 1-52 or jokers A/B.`,
      };
    }

    if (seen.has(parsed)) {
      return {
        ok: false,
        deck: null,
        error: `Card ${parsed === 53 ? "A" : parsed === 54 ? "B" : parsed} appears more than once.`,
      };
    }

    seen.add(parsed);
    deck.push(parsed);
  }

  if (!seen.has(53) || !seen.has(54)) {
    return {
      ok: false,
      deck: null,
      error: "Deck must include exactly one A joker and one B joker.",
    };
  }

  return {
    ok: true,
    deck,
    error: null,
  };
}

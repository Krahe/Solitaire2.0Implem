import type { Deck } from "./deck";

const NO_CRYPTO_SUPPORT_MESSAGE =
  "Unable to compute deck fingerprint: no Web Crypto API (crypto.subtle) or Node crypto.createHash available.";

function getSubtleCrypto(): SubtleCrypto | null {
  if (typeof globalThis === "undefined") {
    return null;
  }

  const globalWithCrypto = globalThis as typeof globalThis & {
    crypto?: Crypto & { subtle?: SubtleCrypto };
    msCrypto?: Crypto & { subtle?: SubtleCrypto };
  };

  const cryptoApi = globalWithCrypto.crypto ?? globalWithCrypto.msCrypto;
  if (!cryptoApi || typeof cryptoApi.subtle?.digest !== "function") {
    return null;
  }

  return cryptoApi.subtle;
}

async function sha256Hex(payload: string): Promise<string> {
  const subtle = getSubtleCrypto();
  if (subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const digest = await subtle.digest("SHA-256", data);
    const hashBytes = new Uint8Array(digest);
    return Array.from(hashBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  try {
    const nodeCrypto: typeof import("node:crypto") = await import("node:crypto");
    if (typeof nodeCrypto.createHash !== "function") {
      throw new Error("createHash is not available");
    }

    return nodeCrypto.createHash("sha256").update(payload, "utf8").digest("hex");
  } catch (error) {
    throw new Error(NO_CRYPTO_SUPPORT_MESSAGE, {
      cause: error instanceof Error ? error : undefined,
    });
  }
}

function serializeDeck(deck: Deck): string {
  return deck.join(",");
}

export async function deckFingerprint(deck: Deck): Promise<string> {
  return sha256Hex(serializeDeck(deck));
}

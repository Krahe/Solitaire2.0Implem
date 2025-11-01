import type { Deck } from "./deck";

const NO_CRYPTO_SUPPORT_MESSAGE =
  "Unable to compute deck fingerprint: no Web Crypto API (crypto.subtle) or Node crypto.createHash available.";

type CreateHashFn = typeof import("crypto").createHash;

let cachedCreateHash: CreateHashFn | null | undefined;
let lastNodeCryptoError: unknown;

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

function isNodeLikeEnvironment(): boolean {
  return (
    typeof process !== "undefined" &&
    typeof process.versions?.node === "string"
  );
}

async function loadNodeCreateHash(): Promise<CreateHashFn | null> {
  if (cachedCreateHash !== undefined) {
    return cachedCreateHash;
  }

  if (!isNodeLikeEnvironment()) {
    cachedCreateHash = null;
    return cachedCreateHash;
  }

  try {
    const nodeCrypto = (await import("node:crypto")) as typeof import("crypto");
    if (typeof nodeCrypto.createHash === "function") {
      cachedCreateHash = nodeCrypto.createHash;
      return cachedCreateHash;
    }
  } catch (error) {
    lastNodeCryptoError = error;
  }

  try {
    const nodeCrypto = (await import("crypto")) as typeof import("crypto");
    if (typeof nodeCrypto.createHash === "function") {
      cachedCreateHash = nodeCrypto.createHash;
      return cachedCreateHash;
    }
  } catch (error) {
    if (!lastNodeCryptoError) {
      lastNodeCryptoError = error;
    }
  }

  cachedCreateHash = null;
  return cachedCreateHash;
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

  const createHash = await loadNodeCreateHash();
  if (createHash) {
    return createHash("sha256").update(payload, "utf8").digest("hex");
  }

  const cause = lastNodeCryptoError instanceof Error ? lastNodeCryptoError : undefined;
  throw new Error(NO_CRYPTO_SUPPORT_MESSAGE, { cause });
}

function serializeDeck(deck: Deck): string {
  return deck.join(",");
}

export async function deckFingerprint(deck: Deck): Promise<string> {
  return sha256Hex(serializeDeck(deck));
}

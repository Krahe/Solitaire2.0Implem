import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SAMPLE_DECK = [1, 2, 53, 54];

function rangeHex(length: number): string {
  return Array.from({ length }, (_, index) => index.toString(16).padStart(2, "0")).join("");
}

describe("deckFingerprint environmental support", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unmock("node:crypto");
    vi.unmock("crypto");
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unmock("node:crypto");
    vi.unmock("crypto");
    vi.unstubAllGlobals();
  });

  it("uses the Web Crypto API when available", async () => {
    const digestBuffer = new Uint8Array(Array.from({ length: 32 }, (_, index) => index)).buffer;
    const digestMock = vi.fn().mockResolvedValue(digestBuffer);

    vi.stubGlobal("crypto", {
      subtle: {
        digest: digestMock,
      },
    });

    const { deckFingerprint } = await import("../deckCode");
    const fingerprint = await deckFingerprint(SAMPLE_DECK);

    expect(digestMock).toHaveBeenCalledTimes(1);
    const [algorithm, payload] = digestMock.mock.calls[0];
    expect(algorithm).toBe("SHA-256");
    expect(ArrayBuffer.isView(payload)).toBe(true);
    expect(fingerprint).toBe(rangeHex(32));
  });

  it("falls back to Node's crypto when Web Crypto is unavailable", async () => {
    const updateMock = vi.fn().mockReturnThis();
    const digestMock = vi.fn().mockReturnValue("nodehash");
    const createHashMock = vi.fn(() => ({
      update: updateMock,
      digest: digestMock,
    }));

    vi.doMock("node:crypto", () => ({
      createHash: createHashMock,
    }));

    vi.stubGlobal("crypto", undefined);
    vi.stubGlobal("msCrypto", undefined);

    const { deckFingerprint } = await import("../deckCode");
    const fingerprint = await deckFingerprint(SAMPLE_DECK);

    expect(createHashMock).toHaveBeenCalledWith("sha256");
    expect(updateMock).toHaveBeenCalledWith("1,2,53,54", "utf8");
    expect(digestMock).toHaveBeenCalledWith("hex");
    expect(fingerprint).toBe("nodehash");
  });

  it("throws a descriptive error when no crypto implementation is present", async () => {
    vi.doMock("node:crypto", () => ({}));
    vi.doMock("crypto", () => ({}));

    vi.stubGlobal("crypto", undefined);
    vi.stubGlobal("msCrypto", undefined);

    const { deckFingerprint } = await import("../deckCode");

    await expect(deckFingerprint(SAMPLE_DECK)).rejects.toThrowError(
      "Unable to compute deck fingerprint"
    );
  });
});

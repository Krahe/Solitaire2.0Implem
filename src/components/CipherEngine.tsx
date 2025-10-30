import React from "react";
import type { Deck } from "../logic/deck";
import { decrypt, encrypt } from "../logic/solitaireCipher";

export interface CipherEngineProps {
  sanitizedText: string;
  deck: Deck | null;
  onDeckUpdate(deck: Deck): void;
  manualDeckVersion: number;
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#0b1120",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
    color: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
  },
  description: {
    margin: 0,
    color: "#cbd5f5",
    fontSize: "0.95rem",
  },
  status: {
    fontSize: "0.85rem",
    color: "#38bdf8",
  },
  warning: {
    fontSize: "0.85rem",
    color: "#f97316",
  },
  error: {
    fontSize: "0.85rem",
    color: "#f87171",
  },
  info: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "0.65rem",
    padding: "0.75rem",
  },
  textarea: {
    width: "100%",
    backgroundColor: "#020617",
    color: "#f8fafc",
    border: "1px solid #334155",
    borderRadius: "0.65rem",
    padding: "0.75rem",
    resize: "vertical",
    fontSize: "0.95rem",
    lineHeight: 1.5,
    minHeight: "6rem",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    alignItems: "center",
  },
  modeToggle: {
    display: "inline-flex",
    borderRadius: "999px",
    border: "1px solid #1e293b",
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  modeButton: {
    padding: "0.45rem 0.9rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    transition: "background-color 0.2s ease, color 0.2s ease",
  },
  modeButtonActive: {
    backgroundColor: "#1d4ed8",
    color: "#f8fafc",
  },
  runButton: {
    backgroundColor: "#22c55e",
    color: "#04111f",
    border: "none",
    borderRadius: "0.65rem",
    padding: "0.6rem 0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  secondaryButton: {
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
    border: "1px solid #334155",
    borderRadius: "0.65rem",
    padding: "0.55rem 0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  runButtonDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  keystreamList: {
    margin: 0,
    padding: 0,
    display: "flex",
    gap: "0.5rem",
    listStyle: "none",
    flexWrap: "wrap",
    fontFamily: "Fira Code, Source Code Pro, Menlo, monospace",
    fontSize: "0.85rem",
  },
};

const KEYSTREAM_PREVIEW = 12;

function decksMatch(a: Deck, b: Deck): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) {
      return false;
    }
  }
  return true;
}

export const CipherEngine: React.FC<CipherEngineProps> = ({
  sanitizedText,
  deck,
  onDeckUpdate,
  manualDeckVersion,
}) => {
  const [resultText, setResultText] = React.useState<string>("");
  const [keystreamPreview, setKeystreamPreview] = React.useState<number[]>([]);
  const [statusMessage, setStatusMessage] = React.useState<string>("Awaiting input.");
  const [error, setError] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [mode, setMode] = React.useState<"encrypt" | "decrypt">("encrypt");
  const [pendingDeck, setPendingDeck] = React.useState<Deck | null>(null);

  const sanitizedLength = sanitizedText.length;
  const deckReady = deck !== null;
  const canRun = deckReady && sanitizedLength > 0 && !isRunning;

  const handleRun = async () => {
    if (!deck) {
      setError("Load a deck vector before running the cipher.");
      return;
    }
    if (sanitizedLength === 0) {
      setError(mode === "encrypt" ? "Add plaintext to encrypt." : "Add ciphertext to decrypt.");
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const timer = typeof performance !== "undefined" ? performance : { now: () => Date.now() };
      const start = timer.now();
      const result = mode === "encrypt" ? encrypt(sanitizedText, deck) : decrypt(sanitizedText, deck);
      const end = timer.now();

      setResultText(result.output);
      setKeystreamPreview(result.keystream.slice(0, KEYSTREAM_PREVIEW));
      setPendingDeck(result.finalDeck);
      setStatusMessage(
        `${mode === "encrypt" ? "Encrypted" : "Decrypted"} ${sanitizedLength.toLocaleString()} characters in ${(end -
          start).toFixed(1)} ms. Apply the advanced deck below if you want to continue the sequence.`,
      );
    } catch (err) {
      const defaultMessage = mode === "encrypt" ? "Encryption failed." : "Decryption failed.";
      setError(err instanceof Error ? err.message : defaultMessage);
    } finally {
      setIsRunning(false);
    }
  };

  React.useEffect(() => {
    // Reset output whenever the sanitized text changes or the user loads a new manual deck.
    setResultText("");
    setKeystreamPreview([]);
    setError(null);
    setPendingDeck(null);
  }, [sanitizedText, manualDeckVersion, mode]);

  React.useEffect(() => {
    if (resultText.length > 0) {
      return;
    }
    if (sanitizedLength === 0) {
      setStatusMessage(mode === "encrypt" ? "Waiting for plaintext." : "Waiting for ciphertext.");
    } else if (!deck) {
      setStatusMessage("Load a deck to begin.");
    } else {
      setStatusMessage(mode === "encrypt" ? "Ready to encrypt." : "Ready to decrypt.");
    }
  }, [resultText, sanitizedLength, deck, manualDeckVersion, mode]);

  return (
    <section style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
        <h2 style={styles.title}>Cipher Execution</h2>
        <div style={styles.modeToggle}>
          <button
            type="button"
            onClick={() => setMode("encrypt")}
            style={{
              ...styles.modeButton,
              ...(mode === "encrypt" ? styles.modeButtonActive : {}),
            }}
          >
            Encrypt
          </button>
          <button
            type="button"
            onClick={() => setMode("decrypt")}
            style={{
              ...styles.modeButton,
              ...(mode === "decrypt" ? styles.modeButtonActive : {}),
            }}
          >
            Decrypt
          </button>
        </div>
      </div>
      <p style={styles.description}>
        Run the full Solitaire algorithm against the sanitized text. We reuse the active deck to build a keystream,
        but leave your original ordering untouched; apply the advanced deck afterwards if you want to keep the
        sequence moving.
      </p>
      <div style={styles.metaRow}>
        <span>{`Sanitized length: ${sanitizedLength.toLocaleString()} characters`}</span>
        <span>{deckReady ? "Deck ready" : "Deck pending"}</span>
      </div>
      {sanitizedLength >= 100000 ? (
        <div style={styles.warning}>
          Processing more than 100,000 characters may take a while. We&apos;ll still run it, but expect the
          browser to pause during encryption.
        </div>
      ) : null}
      <div style={styles.buttonRow}>
        <button
          type="button"
          onClick={handleRun}
          style={{
            ...styles.runButton,
            ...(canRun ? {} : styles.runButtonDisabled),
          }}
          disabled={!canRun}
        >
          {mode === "encrypt" ? "Encrypt sanitized plaintext" : "Decrypt sanitized ciphertext"}
        </button>
        {pendingDeck ? (
          <button
            type="button"
            onClick={() => {
              if (pendingDeck) {
                onDeckUpdate(pendingDeck);
                setPendingDeck(null);
                setStatusMessage("Advanced deck applied. Ready for the next round.");
              }
            }}
            style={{
              ...styles.secondaryButton,
              ...(deck && pendingDeck && decksMatch(deck, pendingDeck) ? styles.runButtonDisabled : {}),
            }}
            disabled={deck && pendingDeck ? decksMatch(deck, pendingDeck) : false}
          >
            Use advanced deck for next run
          </button>
        ) : null}
        <span style={styles.status}>{statusMessage}</span>
      </div>
      {error ? <div style={styles.error}>{error}</div> : null}
      {pendingDeck ? (
        <div style={styles.info}>
          Your original deck stays untouched until you apply the advanced deck. This mirrors using the same key
          twice—only commit the new order when you&apos;re ready to continue the sequence.
        </div>
      ) : null}
      <label style={{ fontSize: "0.85rem", color: "#cbd5f5" }} htmlFor="cipher-output">
        {mode === "encrypt" ? "Cipher text" : "Recovered plaintext"}
      </label>
      <textarea
        id="cipher-output"
        value={resultText}
        readOnly
        style={styles.textarea}
        placeholder={
          mode === "encrypt"
            ? "Run the cipher to populate this cipher text output"
            : "Run the cipher to recover plaintext here"
        }
      />
      {keystreamPreview.length > 0 ? (
        <div>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.35rem" }}>
            First {keystreamPreview.length} keystream values:
          </div>
          <ul style={styles.keystreamList}>
            {keystreamPreview.map((value, index) => (
              <li key={`${value}-${index}`}>{value}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};

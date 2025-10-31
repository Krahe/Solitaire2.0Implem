import React from "react";
import type { Deck } from "../logic/deck";
import { decrypt, encrypt, type CipherWarning } from "../logic/solitaireCipher";
import { theme } from "../styles/theme";

export interface CipherEngineProps {
  sanitizedText: string;
  deck: Deck | null;
  onDeckUpdate(deck: Deck): void;
  manualDeckVersion: number;
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: theme.colors.panelBg,
    border: `1px solid ${theme.colors.panelBorder}`,
    borderRadius: theme.layout.panelRadius,
    padding: theme.layout.panelPadding,
    color: theme.colors.textPrimary,
    display: "flex",
    flexDirection: "column",
    gap: theme.layout.gapSmall,
  },
  title: {
    margin: 0,
    fontSize: theme.typography.sizeLG,
  },
  description: {
    margin: 0,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizeMD,
  },
  status: {
    fontSize: theme.typography.sizeSM,
    color: theme.colors.accent,
  },
  warning: {
    fontSize: theme.typography.sizeSM,
    color: theme.colors.warning,
  },
  error: {
    fontSize: theme.typography.sizeSM,
    color: theme.colors.error,
  },
  info: {
    fontSize: theme.typography.sizeSM,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.panelBgSecondary,
    border: `1px solid ${theme.colors.panelBorder}`,
    borderRadius: theme.layout.buttonRadius,
    padding: theme.layout.gapSmall,
  },
  textarea: {
    width: "100%",
    backgroundColor: theme.colors.inputBg,
    color: theme.colors.textPrimary,
    border: `1px solid ${theme.colors.inputBorder}`,
    borderRadius: theme.layout.buttonRadius,
    padding: theme.layout.gapSmall,
    resize: "vertical",
    fontSize: theme.typography.sizeMD,
    fontFamily: theme.typography.mono,
    lineHeight: 1.5,
    minHeight: "6rem",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.layout.gapSmall,
    alignItems: "center",
  },
  modeToggle: {
    display: "inline-flex",
    borderRadius: theme.layout.badgeRadius,
    border: `1px solid ${theme.colors.panelBorder}`,
    overflow: "hidden",
    backgroundColor: theme.colors.inputBg,
  },
  modeButton: {
    padding: "0.45rem 0.9rem",
    fontSize: theme.typography.sizeSM,
    fontWeight: theme.typography.weightSemibold,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    color: theme.colors.textMuted,
    transition: theme.effects.transitionNormal,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.accentBright,
    color: theme.colors.textPrimary,
  },
  runButton: {
    backgroundColor: theme.colors.buttonPrimary,
    color: theme.colors.buttonPrimaryText,
    border: "none",
    borderRadius: theme.layout.buttonRadius,
    padding: "0.6rem 0.9rem",
    fontWeight: theme.typography.weightSemibold,
    cursor: "pointer",
    fontSize: theme.typography.sizeMD,
    transition: theme.effects.transitionNormal,
  },
  secondaryButton: {
    backgroundColor: theme.colors.buttonSecondary,
    color: theme.colors.buttonSecondaryText,
    border: `1px solid ${theme.colors.inputBorder}`,
    borderRadius: theme.layout.buttonRadius,
    padding: "0.55rem 0.85rem",
    fontWeight: theme.typography.weightSemibold,
    cursor: "pointer",
    fontSize: theme.typography.sizeMD,
    transition: theme.effects.transitionNormal,
  },
  runButtonDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    fontSize: theme.typography.sizeSM,
    color: theme.colors.textMuted,
  },
  keystreamList: {
    margin: 0,
    padding: 0,
    display: "flex",
    gap: "0.5rem",
    listStyle: "none",
    flexWrap: "wrap",
    fontFamily: theme.typography.mono,
    fontSize: theme.typography.sizeSM,
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
  const [warning, setWarning] = React.useState<CipherWarning | null>(null);

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

    const continuedFromPreviousRun = pendingDeck !== null;

    setIsRunning(true);
    setError(null);

    try {
      const timer = typeof performance !== "undefined" ? performance : { now: () => Date.now() };
      const start = timer.now();
      const result =
        mode === "encrypt"
          ? encrypt(sanitizedText, deck, { continuedFromPreviousRun })
          : decrypt(sanitizedText, deck, { continuedFromPreviousRun });
      const end = timer.now();

      setResultText(result.output);
      setKeystreamPreview(result.keystream.slice(0, KEYSTREAM_PREVIEW));
      setPendingDeck(result.finalDeck);
      setWarning(result.warning ?? null);
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
    setWarning(null);
  }, [sanitizedText, manualDeckVersion, mode]);

  React.useEffect(() => {
    // A freshly loaded manual deck should discard any queued advanced deck so the next run starts clean.
    setPendingDeck(null);
    setWarning(null);
  }, [manualDeckVersion]);

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
          <>
            <button
              type="button"
              onClick={() => {
                if (pendingDeck) {
                  onDeckUpdate(pendingDeck);
                  setPendingDeck(null);
                  setWarning(null);
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
            <button
              type="button"
              onClick={() => {
                setPendingDeck(null);
                setWarning(null);
                setStatusMessage("Pending advanced deck dismissed. Current deck remains unchanged.");
              }}
              style={styles.secondaryButton}
            >
              Dismiss pending deck
            </button>
          </>
        ) : null}
        <span style={styles.status}>{statusMessage}</span>
      </div>
      {error ? <div style={styles.error}>{error}</div> : null}
      {warning ? (
        <div style={{ ...styles.warning, fontWeight: 600 }}>
          Warning: You just reused a keystream without applying the previously advanced deck. Apply or dismiss the
          pending deck before continuing to avoid keystream reuse.
        </div>
      ) : null}
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

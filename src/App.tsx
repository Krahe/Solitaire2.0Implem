import React from "react";
import { DeckInput } from "./components/DeckInput";
import { PlaintextInput } from "./components/PlaintextInput";
import { CipherEngine } from "./components/CipherEngine";
import { sanitizeToCipherAlphabet } from "./logic/classifier";
import type { Deck } from "./logic/deck";

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "2rem 1.5rem 4rem",
  background: "radial-gradient(circle at top, #1e293b, #020617 60%)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gap: "1.5rem",
  maxWidth: "1080px",
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  color: "#e2e8f0",
  textAlign: "center",
  marginBottom: "2rem",
};

const deckPreviewStyle: React.CSSProperties = {
  backgroundColor: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "1.25rem",
  color: "#e2e8f0",
};

const deckBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.35rem 0.6rem",
  borderRadius: "999px",
  backgroundColor: "#1d4ed8",
  color: "#f8fafc",
  fontSize: "0.8rem",
  fontWeight: 600,
};

const deckPreviewContentStyle: React.CSSProperties = {
  marginTop: "0.75rem",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontFamily: "Fira Code, Source Code Pro, Menlo, Consolas, monospace",
  fontSize: "0.9rem",
  lineHeight: 1.6,
};

const emptyDeckStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontStyle: "italic",
};

const MAX_PLAINTEXT_LENGTH = 100_000;

function App(): JSX.Element {
  const [plaintext, setPlaintext] = React.useState<string>("");
  const [limitReached, setLimitReached] = React.useState<boolean>(false);
  const sanitized = React.useMemo(() => sanitizeToCipherAlphabet(plaintext), [plaintext]);
  const [deck, setDeck] = React.useState<Deck | null>(null);
  const [manualDeckVersion, setManualDeckVersion] = React.useState<number>(0);

  const handlePlaintextChange = React.useCallback((nextValue: string) => {
    if (nextValue.length > MAX_PLAINTEXT_LENGTH) {
      setPlaintext(nextValue.slice(0, MAX_PLAINTEXT_LENGTH));
      setLimitReached(true);
    } else {
      setPlaintext(nextValue);
      setLimitReached(false);
    }
  }, []);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Solitaire Cipher Playground</h1>
        <p style={{ marginTop: "0.75rem", color: "#cbd5f5", maxWidth: "720px", marginInline: "auto" }}>
          Prepare your plaintext and load a deck vector. We&apos;ll sanitize Unicode text into the
          classic 52-symbol alphabet and make sure your deck is ready for the Solitaire cipher dance.
        </p>
      </header>
      <div style={gridStyle}>
        <PlaintextInput
          value={plaintext}
          onChange={handlePlaintextChange}
          sanitized={sanitized}
          maxLength={MAX_PLAINTEXT_LENGTH}
          limitReached={limitReached}
        />
        <DeckInput
          onSubmit={(newDeck) => {
            setDeck(newDeck);
            setManualDeckVersion((version) => version + 1);
          }}
        />
        <section style={deckPreviewStyle}>
          <div style={deckBadgeStyle}>{deck ? "Deck loaded" : "Deck pending"}</div>
          <h2 style={{ marginTop: "0.85rem", marginBottom: "0.5rem", fontSize: "1.15rem" }}>
            Active deck (top → bottom)
          </h2>
          {deck ? (
            <pre style={deckPreviewContentStyle}>{deck.join(", ")}</pre>
          ) : (
            <p style={emptyDeckStyle}>
              No deck yet. Paste a vector above or generate one with the shuffler to begin the cipher
              ritual.
            </p>
          )}
          <p style={{ marginTop: "1rem", color: "#94a3b8", fontSize: "0.9rem" }}>
            The encryption step consumes the deck in-place—each run advances it through every shuffle,
            triple cut, and count cut just like the field ritual. Load a fresh deck or paste a saved
            vector before your next mission if you need to reproduce results.
          </p>
        </section>
        <CipherEngine
          sanitizedText={sanitized.value}
          deck={deck}
          onDeckUpdate={setDeck}
          manualDeckVersion={manualDeckVersion}
        />
      </div>
    </div>
  );
}

export default App;

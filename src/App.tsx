import React from "react";
import { DeckInput } from "./components/DeckInput";
import { PlaintextInput } from "./components/PlaintextInput";
import { CipherEngine } from "./components/CipherEngine";
import { QuantumBackground } from "./components/QuantumBackground";
import { QuantumControls } from "./components/QuantumControls";
import { GlobalStyles } from "./styles/GlobalStyles";
import { AppShell } from "./components/AppShell";
import { theme } from "./styles/theme";
import { sanitizeToCipherAlphabet } from "./logic/classifier";
import type { Deck } from "./logic/deck";
import { parseDeckVector } from "./logic/parseDeck";
import { theme } from "./styles/theme";

const containerStyle: React.CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  padding: "2rem 1.5rem 4rem",
  isolation: "isolate",
};

const gridStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gap: theme.layout.gapBetweenPanels,
  maxWidth: "1400px", // Wide single column
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  color: theme.colors.textPrimary,
  textAlign: "center",
  marginBottom: "2rem",
  gridColumn: "1 / -1", // Span full width on grid
};

const headerActionsStyle: React.CSSProperties = {
  marginTop: "1.5rem",
  display: "flex",
  justifyContent: "center",
};

const deckPreviewStyle: React.CSSProperties = {
  backgroundColor: theme.colors.panelBgSecondary,
  border: `1px solid ${theme.colors.panelBorder}`,
  borderRadius: theme.layout.panelRadius,
  padding: theme.layout.panelPadding,
  color: theme.colors.textPrimary,
};

const deckBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: theme.layout.gapTiny,
  padding: "0.35rem 0.6rem",
  borderRadius: theme.layout.badgeRadius,
  backgroundColor: theme.colors.accentBright,
  color: theme.colors.textPrimary,
  fontSize: theme.typography.sizeXS,
  fontWeight: theme.typography.weightSemibold,
};

const deckPreviewContentStyle: React.CSSProperties = {
  marginTop: theme.layout.gapSmall,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontFamily: theme.typography.mono,
  fontSize: theme.typography.sizeMD,
  lineHeight: 1.6,
};

const emptyDeckStyle: React.CSSProperties = {
  color: theme.colors.textMuted,
  fontStyle: "italic",
};

const resetButtonStyle: React.CSSProperties = {
  backgroundColor: theme.colors.error,
  color: theme.colors.panelBg,
  border: "none",
  borderRadius: theme.layout.badgeRadius,
  padding: "0.6rem 1.1rem",
  fontWeight: theme.typography.weightSemibold,
  cursor: "pointer",
  fontSize: theme.typography.sizeMD,
  transition: theme.effects.transitionNormal,
};

const resetButtonDisabledStyle: React.CSSProperties = {
  opacity: 0.4,
  cursor: "not-allowed",
};

const MAX_PLAINTEXT_LENGTH = 100_000;

const STORAGE_KEYS = {
  plaintext: "solitaire.playground.plaintext",
  deckVector: "solitaire.playground.deckVector",
} as const;

function App(): JSX.Element {
  const [plaintext, setPlaintext] = React.useState<string>("");
  const [limitReached, setLimitReached] = React.useState<boolean>(false);
  const sanitized = React.useMemo(() => sanitizeToCipherAlphabet(plaintext), [plaintext]);
  const [deck, setDeck] = React.useState<Deck | null>(null);
  const [deckInputValue, setDeckInputValue] = React.useState<string>("");
  const [manualDeckVersion, setManualDeckVersion] = React.useState<number>(0);
  const [hydrated, setHydrated] = React.useState<boolean>(false);
  const [quantumNx, setQuantumNx] = React.useState<number>(2);
  const [quantumNy, setQuantumNy] = React.useState<number>(2);
  const [quantumAnimating, setQuantumAnimating] = React.useState<boolean>(true);

  const handlePlaintextChange = React.useCallback((nextValue: string) => {
    if (nextValue.length > MAX_PLAINTEXT_LENGTH) {
      setPlaintext(nextValue.slice(0, MAX_PLAINTEXT_LENGTH));
      setLimitReached(true);
    } else {
      setPlaintext(nextValue);
      setLimitReached(false);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedPlaintext = window.localStorage.getItem(STORAGE_KEYS.plaintext);
      if (storedPlaintext) {
        handlePlaintextChange(storedPlaintext);
      }

      const storedDeck = window.localStorage.getItem(STORAGE_KEYS.deckVector);
      if (storedDeck) {
        setDeckInputValue(storedDeck);
        const parsed = parseDeckVector(storedDeck);
        if (parsed.ok && parsed.deck) {
          setDeck(parsed.deck);
          setManualDeckVersion((version) => version + 1);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to restore Solitaire session", error);
    } finally {
      setHydrated(true);
    }
  }, [handlePlaintextChange]);

  React.useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    try {
      if (plaintext.length === 0) {
        window.localStorage.removeItem(STORAGE_KEYS.plaintext);
      } else {
        window.localStorage.setItem(STORAGE_KEYS.plaintext, plaintext);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to persist plaintext", error);
    }
  }, [plaintext, hydrated]);

  React.useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    if (!deck || deck.length !== 54) {
      return;
    }

    try {
      const serialized = deck.join(", ");
      window.localStorage.setItem(STORAGE_KEYS.deckVector, serialized);
      setDeckInputValue(serialized);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to persist deck vector", error);
    }
  }, [deck, hydrated]);

  // Quantum field animation - slow oscillation through parameter space
  React.useEffect(() => {
    if (!quantumAnimating) {
      return;
    }

    let animationFrameId: number;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000; // seconds

      // Slow oscillation with different periods for nx and ny
      // Creates organic, breathing patterns
      // nx oscillates with period ~20 seconds, range 0-5
      // ny oscillates with period ~27 seconds (golden ratio relative), range 0-5
      const nxFloat = 2.5 + 2.5 * Math.sin(elapsed * Math.PI / 10);
      const nyFloat = 2.5 + 2.5 * Math.cos(elapsed * Math.PI / 13.5);

      const newNx = Math.round(nxFloat);
      const newNy = Math.round(nyFloat);

      setQuantumNx(newNx);
      setQuantumNy(newNy);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [quantumAnimating]);

  const handleResetSession = React.useCallback(() => {
    setPlaintext("");
    setLimitReached(false);
    setDeck(null);
    setManualDeckVersion((version) => version + 1);

    setDeckInputValue("");

    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(STORAGE_KEYS.plaintext);
      window.localStorage.removeItem(STORAGE_KEYS.deckVector);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to clear stored session", error);
    }
  }, []);

  const hasSessionData = plaintext.length > 0 || (deck?.length ?? 0) > 0;

  return (
    <div style={containerStyle}>
      <GlobalStyles />
      <QuantumBackground nx={quantumNx} ny={quantumNy} opacity={0.35} />
      <QuantumControls
        nx={quantumNx}
        ny={quantumNy}
        onNxChange={setQuantumNx}
        onNyChange={setQuantumNy}
        animating={quantumAnimating}
        onAnimatingToggle={setQuantumAnimating}
      />
      <header style={headerStyle}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Solitaire Cipher Playground</h1>
        <p style={{ marginTop: "0.75rem", color: "#cbd5f5", maxWidth: "720px", marginInline: "auto" }}>
          Prepare your plaintext and load a deck vector. We&apos;ll sanitize Unicode text into the
          classic 52-symbol alphabet and make sure your deck is ready for the Solitaire cipher dance.
        </p>
        <div style={headerActionsStyle}>
          <button
            type="button"
            onClick={handleResetSession}
            style={{
              ...resetButtonStyle,
              ...(hasSessionData ? {} : resetButtonDisabledStyle),
            }}
            initialValue={deckInputValue}
          />
          <section style={styles.deckCard}>
            <div style={styles.deckBadge}>{deck ? "Deck loaded" : "Deck pending"}</div>
            <h2 style={styles.deckTitle}>Active deck (top → bottom)</h2>
          {deck ? (
              <pre style={styles.deckPreview}>{deck.join(", ")}</pre>
          ) : (
              <p style={styles.emptyDeck}>
              No deck yet. Paste a vector above or generate one with the shuffler to begin the cipher
              ritual.
            </p>
          )}
            <p style={styles.deckNote}>
              The encryption step consumes the deck in-place—each run advances it through every shuffle, triple cut, and
              count cut just like the field ritual. Load a fresh deck or paste a saved vector before your next mission if you
              need to reproduce results.
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
    </AppShell>
  );
}

export default App;

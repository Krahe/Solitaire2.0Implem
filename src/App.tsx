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

const styles: Record<string, React.CSSProperties> = {
  inner: {
    width: "100%",
    maxWidth: theme.layout.maxContentWidth,
    display: "flex",
    flexDirection: "column",
    gap: "2.5rem",
    marginInline: "auto",
  },
  header: {
    textAlign: "center",
    color: theme.colors.textPrimary,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  headerTitle: {
    fontSize: "2rem",
    margin: 0,
    letterSpacing: "0.02em",
    textShadow: theme.effects.glow,
  },
  headerLead: {
    margin: 0,
    color: theme.colors.textSecondary,
    fontSize: "1rem",
    lineHeight: 1.6,
    maxWidth: "720px",
    marginInline: "auto",
  },
  headerActions: {
    display: "flex",
    justifyContent: "center",
  },
  resetButton: {
    backgroundColor: theme.colors.actionDangerBg,
    color: theme.colors.actionDangerText,
    border: "none",
    borderRadius: "999px",
    padding: "0.6rem 1.2rem",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 10px 24px rgba(239, 68, 68, 0.2)",
  },
  resetButtonDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  grid: {
    display: "grid",
    gap: theme.layout.gapBetweenPanels,
    width: "100%",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  },
  deckCard: {
    backgroundColor: theme.colors.panelBg,
    border: `1px solid ${theme.colors.panelBorder}`,
    borderRadius: theme.layout.panelRadius,
    padding: theme.layout.panelPadding,
    color: theme.colors.textPrimary,
    boxShadow: theme.effects.panelShadow,
    backdropFilter: "blur(18px)",
  },
  deckBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.35rem 0.65rem",
    borderRadius: "999px",
    backgroundColor: theme.colors.badgeBg,
    color: theme.colors.badgeText,
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
  deckTitle: {
    marginTop: "0.9rem",
    marginBottom: "0.6rem",
    fontSize: "1.15rem",
    color: theme.colors.textPrimary,
  },
  deckPreview: {
    marginTop: "0.75rem",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: theme.typography.mono,
    fontSize: "0.9rem",
    lineHeight: 1.6,
    backgroundColor: theme.colors.controlBg,
    border: `1px solid ${theme.colors.controlBorderMuted}`,
    borderRadius: "0.75rem",
    padding: "0.75rem",
  },
  emptyDeck: {
    color: theme.colors.textMuted,
    fontStyle: "italic",
    margin: 0,
  },
  deckNote: {
    marginTop: "1rem",
    color: theme.colors.textMuted,
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
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

  React.useEffect(() => {
    if (!quantumAnimating || typeof window === "undefined") {
      return;
    }

    let animationFrameId = 0;
    const startTime = window.performance?.now() ?? Date.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;

      const nxFloat = 2.5 + 2.5 * Math.sin((elapsed * Math.PI) / 10);
      const nyFloat = 2.5 + 2.5 * Math.cos((elapsed * Math.PI) / 13.5);

      setQuantumNx(Math.round(nxFloat));
      setQuantumNy(Math.round(nyFloat));

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [quantumAnimating, setQuantumNx, setQuantumNy]);

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
    <>
      <GlobalStyles />
      <AppShell background={<QuantumBackground nx={quantumNx} ny={quantumNy} opacity={0.35} />}>
        <QuantumControls
          nx={quantumNx}
          ny={quantumNy}
          onNxChange={setQuantumNx}
          onNyChange={setQuantumNy}
          animating={quantumAnimating}
          onAnimatingToggle={setQuantumAnimating}
        />
        <div style={styles.inner}>
          <header style={styles.header}>
            <h1 style={styles.headerTitle}>Solitaire Cipher Playground</h1>
            <p style={styles.headerLead}>
              Prepare your plaintext and load a deck vector. We&apos;ll sanitize Unicode text into the classic 52-symbol
              alphabet and make sure your deck is ready for the Solitaire cipher dance.
            </p>
            <div style={styles.headerActions}>
              <button
                type="button"
                onClick={handleResetSession}
                style={{
                  ...styles.resetButton,
                  ...(hasSessionData ? {} : styles.resetButtonDisabled),
                }}
                disabled={!hasSessionData}
              >
                Clear saved session
              </button>
            </div>
          </header>
          <div style={styles.grid}>
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
              initialValue={deckInputValue}
            />
            <section style={styles.deckCard}>
              <div style={styles.deckBadge}>{deck ? "Deck loaded" : "Deck pending"}</div>
              <h2 style={styles.deckTitle}>Active deck (top → bottom)</h2>
              {deck ? (
                <pre style={styles.deckPreview}>{deck.join(", ")}</pre>
              ) : (
                <p style={styles.emptyDeck}>
                  No deck yet. Paste a vector above or generate one with the shuffler to begin the cipher ritual.
                </p>
              )}
              <p style={styles.deckNote}>
                The encryption step consumes the deck in-place—each run advances it through every shuffle, triple cut, and
                count cut just like the field ritual. Load a fresh deck or paste a saved vector before your next mission if
                you need to reproduce results.
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
    </>
  );
}

export default App;

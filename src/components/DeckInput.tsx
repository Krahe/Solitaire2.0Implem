import React from "react";
import { createOrderedDeck, shuffleDeck, type Deck } from "../logic/deck";
import { parseDeckVector, type ParseResult } from "../logic/parseDeck";
import { theme } from "../styles/theme";

export interface DeckInputProps {
  onSubmit(deck: Deck): void;
  initialValue?: string;
}

const stringifyDeck = (deck: Deck): string => deck.join(", ");

export const DeckInput: React.FC<DeckInputProps> = ({ onSubmit, initialValue = "" }) => {
  const [raw, setRaw] = React.useState(initialValue);
  const previousInitialRef = React.useRef(initialValue);

  React.useEffect(() => {
    if (initialValue !== previousInitialRef.current) {
      previousInitialRef.current = initialValue;
      setRaw((current) => (current === initialValue ? current : initialValue));
    }
  }, [initialValue]);

  const parsed: ParseResult = React.useMemo(() => {
    if (raw.trim().length === 0) {
      return {
        ok: false,
        deck: null,
        error: "Paste or type your 54-card deck vector.",
      };
    }
    return parseDeckVector(raw);
  }, [raw]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (parsed.ok && parsed.deck) {
      onSubmit(parsed.deck);
    }
  };

  const applyDeck = React.useCallback(
    (nextDeck: Deck) => {
      setRaw(stringifyDeck(nextDeck));
      onSubmit(nextDeck);
    },
    [onSubmit],
  );

  const handleLoadOrdered = () => {
    applyDeck(createOrderedDeck());
  };

  const handleShuffleDeck = () => {
    applyDeck(shuffleDeck());
  };

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Deck Setup</h2>
      <p style={styles.description}>
        Enter your deck vector from top to bottom. Use numbers 1–52 for the
        standard cards and jokers as either A/B or 53/54.
      </p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label} htmlFor="deck-input">
          Deck vector
        </label>
        <textarea
          id="deck-input"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="13, 8, 3, 7, B, 14, 2, 48, ..."
          rows={4}
          style={styles.textarea}
        />
        <div
          role="status"
          aria-live="polite"
          style={parsed.ok ? styles.successMessage : styles.errorMessage}
        >
          {parsed.ok ? "Deck looks valid ✔" : parsed.error}
        </div>
        <button
          type="submit"
          style={{
            ...styles.button,
            ...(parsed.ok ? {} : styles.buttonDisabled),
          }}
          disabled={!parsed.ok}
        >
          Use this deck
        </button>
        <div style={styles.helperRow}>
          <button type="button" style={styles.secondaryButton} onClick={handleLoadOrdered}>
            Load ordered deck
          </button>
          <button type="button" style={styles.secondaryButton} onClick={handleShuffleDeck}>
            Shuffle a new deck
          </button>
        </div>
        <p style={styles.helperText}>
          Shuffling prefers the browser&apos;s cryptographic random generator when available, falling back to
          Math.random only if necessary. Your latest deck vector is saved locally so you can resume
          missions later; hit the mission reset button in the header to clear it.
        </p>
      </form>
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: theme.colors.panelBg,
    border: `1px solid ${theme.colors.panelBorder}`,
    borderRadius: theme.layout.panelRadius,
    padding: theme.layout.panelPadding,
    color: theme.colors.textPrimary,
    boxShadow: theme.effects.panelShadow,
    backdropFilter: "blur(18px)",
  },
  title: {
    marginTop: 0,
    marginBottom: "0.75rem",
    fontSize: "1.25rem",
  },
  description: {
    marginTop: 0,
    marginBottom: "0.75rem",
    fontSize: "0.95rem",
    color: theme.colors.textSecondary,
    lineHeight: 1.6,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  label: {
    fontSize: "0.85rem",
    color: theme.colors.textSecondary,
    letterSpacing: "0.01em",
  },
  textarea: {
    width: "100%",
    backgroundColor: theme.colors.controlBg,
    color: theme.colors.textPrimary,
    border: `1px solid ${theme.colors.controlBorder}`,
    borderRadius: "0.75rem",
    padding: "0.75rem",
    resize: "vertical",
    fontSize: "0.95rem",
    lineHeight: 1.5,
    fontFamily: theme.typography.mono,
  },
  successMessage: {
    fontSize: "0.85rem",
    color: theme.colors.textSuccess,
    minHeight: "1.2rem",
  },
  errorMessage: {
    fontSize: "0.85rem",
    color: theme.colors.textError,
    minHeight: "1.2rem",
  },
  button: {
    backgroundColor: theme.colors.actionPrimaryBg,
    color: theme.colors.actionPrimaryText,
    border: `1px solid ${theme.colors.actionPrimaryBorder}`,
    borderRadius: "0.75rem",
    padding: "0.6rem 1rem",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
    letterSpacing: "0.01em",
    boxShadow: theme.effects.glow,
  },
  buttonDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  helperRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  secondaryButton: {
    backgroundColor: theme.colors.actionSecondaryBg,
    color: theme.colors.actionSecondaryText,
    border: `1px solid ${theme.colors.actionSecondaryBorder}`,
    borderRadius: "0.75rem",
    padding: "0.5rem 0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.2s ease, border-color 0.2s ease",
  },
  helperText: {
    margin: 0,
    fontSize: "0.8rem",
    color: theme.colors.textMuted,
    lineHeight: 1.5,
  },
};

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
  },
  title: {
    marginTop: 0,
    marginBottom: theme.layout.gapSmall,
    fontSize: theme.typography.sizeLG,
  },
  description: {
    marginTop: 0,
    marginBottom: theme.layout.gapSmall,
    fontSize: theme.typography.sizeMD,
    color: theme.colors.textSecondary,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.layout.gapSmall,
  },
  label: {
    fontSize: theme.typography.sizeSM,
    color: theme.colors.textSecondary,
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
    fontFamily: theme.typography.mono,
  },
  successMessage: {
    fontSize: theme.typography.sizeSM,
    color: theme.colors.success,
    minHeight: "1.2rem",
  },
  errorMessage: {
    fontSize: theme.typography.sizeSM,
    color: theme.colors.error,
    minHeight: "1.2rem",
  },
  button: {
    backgroundColor: theme.colors.accentBright,
    color: theme.colors.textPrimary,
    border: "none",
    borderRadius: theme.layout.buttonRadius,
    padding: "0.6rem 0.9rem",
    fontWeight: theme.typography.weightSemibold,
    cursor: "pointer",
    fontSize: theme.typography.sizeMD,
    transition: theme.effects.transitionNormal,
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
    backgroundColor: theme.colors.buttonSecondary,
    color: theme.colors.buttonSecondaryText,
    border: `1px solid ${theme.colors.inputBorder}`,
    borderRadius: theme.layout.buttonRadius,
    padding: "0.5rem 0.75rem",
    fontWeight: theme.typography.weightSemibold,
    cursor: "pointer",
    fontSize: theme.typography.sizeMD,
    transition: theme.effects.transitionNormal,
  },
  helperText: {
    margin: 0,
    fontSize: theme.typography.sizeXS,
    color: theme.colors.textMuted,
    lineHeight: 1.5,
  },
};

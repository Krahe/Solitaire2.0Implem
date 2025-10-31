import React from "react";
import type { SanitizationResult } from "../logic/classifier";
import { theme } from "../styles/theme";

export interface PlaintextInputProps {
  value: string;
  onChange(value: string): void;
  sanitized: SanitizationResult;
  maxLength: number;
  limitReached: boolean;
}

export const PlaintextInput: React.FC<PlaintextInputProps> = ({
  value,
  onChange,
  sanitized,
  maxLength,
  limitReached,
}) => {
  const modifications = sanitized.changes;

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Plaintext Preparation</h2>
      <p style={styles.description}>
        Paste or type your message below. We&apos;ll normalize it into the
        52-character Solitaire alphabet automatically. Inputs longer than
        {` ${maxLength.toLocaleString()} `}
        characters are truncated to keep the browser responsive. Your draft is saved locally so you can
        return later—tap “Clear saved session” in the header when you want to start fresh.
      </p>
      <label style={styles.label} htmlFor="plaintext-input">
        Raw input
      </label>
      <textarea
        id="plaintext-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type or paste text to encrypt"
        rows={6}
        style={styles.textarea}
      />
      <div style={styles.summaryRow}>
        <span>{`Raw length: ${value.length.toLocaleString()} / ${maxLength.toLocaleString()}`}</span>
        <span>{`Sanitized length: ${sanitized.value.length.toLocaleString()}`}</span>
      </div>
      {limitReached ? (
        <div style={styles.limitNotice}>
          Input truncated at {maxLength.toLocaleString()} characters. Consider processing long documents in
          sections for smoother interaction.
        </div>
      ) : null}
      <div style={{ ...styles.summaryRow, justifyContent: "flex-end" }}>
        <span>{`Changes applied: ${modifications.length.toLocaleString()}`}</span>
      </div>
      <label style={styles.label} htmlFor="sanitized-output">
        Cipher-ready output
      </label>
      <textarea
        id="sanitized-output"
        value={sanitized.value}
        readOnly
        rows={6}
        style={{ ...styles.textarea, backgroundColor: theme.colors.panelBgSecondary }}
      />
      {modifications.length > 0 ? (
        <details style={styles.details}>
          <summary style={styles.summary}>View normalization log</summary>
          <ul style={styles.list}>
            {modifications.map((change, index) => (
              <li key={`${change.index}-${index}`} style={styles.listItem}>
                <code style={styles.code}>{change.original}</code>
                {" → "}
                <code style={styles.code}>{change.replacement}</code>
                {change.reason ? (
                  <span style={styles.reason}>{` (${change.reason})`}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <p style={{ ...styles.description, color: theme.colors.textMuted }}>
          No normalization needed—your text already fits the cipher alphabet.
        </p>
      )}
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
  label: {
    display: "block",
    marginBottom: theme.layout.gapTiny,
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
    marginBottom: theme.layout.gapSmall,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: theme.typography.sizeSM,
    marginBottom: theme.layout.gapSmall,
    color: theme.colors.textMuted,
  },
  limitNotice: {
    backgroundColor: theme.colors.accentBright,
    color: theme.colors.textPrimary,
    borderRadius: theme.layout.buttonRadius,
    padding: "0.5rem 0.75rem",
    fontSize: theme.typography.sizeSM,
    marginBottom: theme.layout.gapSmall,
  },
  details: {
    marginTop: "0.5rem",
  },
  summary: {
    cursor: "pointer",
    fontSize: theme.typography.sizeSM,
    color: theme.colors.accent,
  },
  list: {
    marginTop: "0.5rem",
    marginBottom: 0,
    paddingLeft: theme.layout.panelPadding,
    display: "grid",
    gap: theme.layout.gapTiny,
  },
  listItem: {
    fontSize: theme.typography.sizeSM,
    color: theme.colors.textSecondary,
  },
  code: {
    backgroundColor: theme.colors.panelBorder,
    padding: "0.15rem 0.35rem",
    borderRadius: theme.layout.gapTiny,
    fontFamily: theme.typography.mono,
  },
  reason: {
    color: theme.colors.accent,
  },
};

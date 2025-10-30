import React from "react";
import type { SanitizationResult } from "../logic/classifier";

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
        characters are truncated to keep the browser responsive.
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
        style={{ ...styles.textarea, backgroundColor: "#0f172a" }}
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
        <p style={{ ...styles.description, color: "#94a3b8" }}>
          No normalization needed—your text already fits the cipher alphabet.
        </p>
      )}
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#0b1120",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
    color: "#e2e8f0",
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
    color: "#cbd5f5",
  },
  label: {
    display: "block",
    marginBottom: "0.35rem",
    fontSize: "0.85rem",
    color: "#cbd5f5",
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
    marginBottom: "0.75rem",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.85rem",
    marginBottom: "0.75rem",
    color: "#94a3b8",
  },
  limitNotice: {
    backgroundColor: "#1d4ed8",
    color: "#e0f2fe",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.85rem",
    marginBottom: "0.75rem",
  },
  details: {
    marginTop: "0.5rem",
  },
  summary: {
    cursor: "pointer",
    fontSize: "0.85rem",
    color: "#a855f7",
  },
  list: {
    marginTop: "0.5rem",
    marginBottom: 0,
    paddingLeft: "1.25rem",
    display: "grid",
    gap: "0.35rem",
  },
  listItem: {
    fontSize: "0.85rem",
    color: "#cbd5f5",
  },
  code: {
    backgroundColor: "#1e293b",
    padding: "0.15rem 0.35rem",
    borderRadius: "0.35rem",
  },
  reason: {
    color: "#38bdf8",
  },
};

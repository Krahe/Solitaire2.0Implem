import React from "react";
import { theme } from "../styles/theme";

export interface QuantumControlsProps {
  nx: number;
  ny: number;
  onNxChange: (value: number) => void;
  onNyChange: (value: number) => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    bottom: "1.5rem",
    right: "1.5rem",
    backgroundColor: theme.colors.infoPanelBg,
    border: `1px solid ${theme.colors.panelBorder}`,
    borderRadius: theme.layout.panelRadius,
    padding: "1rem 1.15rem",
    color: theme.colors.textPrimary,
    zIndex: 100,
    minWidth: "240px",
    backdropFilter: "blur(12px)",
    boxShadow: theme.effects.panelShadow,
  },
  title: {
    margin: 0,
    fontSize: "0.9rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
    color: theme.colors.textSecondary,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  control: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  label: {
    fontSize: "0.85rem",
    minWidth: "3rem",
    fontFamily: theme.typography.mono,
    color: theme.colors.textMuted,
  },
  value: {
    fontSize: "0.85rem",
    fontWeight: 600,
    minWidth: "1.5rem",
    textAlign: "right",
    fontFamily: theme.typography.mono,
    color: theme.colors.textAccent,
  },
  info: {
    marginTop: "0.75rem",
    fontSize: "0.75rem",
    color: theme.colors.textMuted,
    lineHeight: 1.4,
  },
};

/**
 * Control panel for adjusting quantum harmonic oscillator quantum numbers
 */
export const QuantumControls: React.FC<QuantumControlsProps> = ({
  nx,
  ny,
  onNxChange,
  onNyChange,
}) => {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Quantum Background</h3>
      <div style={styles.controlGroup}>
        <div style={styles.control}>
          <label htmlFor="quantum-nx" style={styles.label}>
            nₓ
          </label>
          <input
            id="quantum-nx"
            type="range"
            min="0"
            max="8"
            step="1"
            value={nx}
            onChange={(e) => onNxChange(parseInt(e.target.value, 10))}
            className="quantum-slider"
          />
          <span style={styles.value}>{nx}</span>
        </div>
        <div style={styles.control}>
          <label htmlFor="quantum-ny" style={styles.label}>
            nᵧ
          </label>
          <input
            id="quantum-ny"
            type="range"
            min="0"
            max="8"
            step="1"
            value={ny}
            onChange={(e) => onNyChange(parseInt(e.target.value, 10))}
            className="quantum-slider"
          />
          <span style={styles.value}>{ny}</span>
        </div>
      </div>
      <p style={styles.info}>
        2D quantum harmonic oscillator eigenstate ψ<sub>{nx},{ny}</sub>(x,y).
        Energy level: {nx + ny + 1}ℏω
      </p>
    </div>
  );
};

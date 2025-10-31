import React from "react";
import { theme } from "../styles/theme";

export interface QuantumControlsProps {
  nx: number;
  ny: number;
  onNxChange: (value: number) => void;
  onNyChange: (value: number) => void;
  animating: boolean;
  onAnimatingToggle: (animating: boolean) => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    bottom: theme.layout.gapBetweenPanels,
    right: theme.layout.gapBetweenPanels,
    backgroundColor: theme.colors.panelBg,
    border: `1px solid ${theme.colors.panelBorder}`,
    borderRadius: theme.layout.panelRadius,
    padding: "1rem",
    color: theme.colors.textPrimary,
    zIndex: 100,
    minWidth: theme.layout.panelMinWidth,
    backdropFilter: theme.effects.backdropBlur,
  },
  title: {
    margin: 0,
    fontSize: theme.typography.sizeMD,
    fontWeight: theme.typography.weightSemibold,
    marginBottom: theme.layout.gapSmall,
    color: theme.colors.textMuted,
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: theme.layout.gapSmall,
  },
  control: {
    display: "flex",
    alignItems: "center",
    gap: theme.layout.gapSmall,
  },
  label: {
    fontSize: theme.typography.sizeSM,
    minWidth: "3rem",
    fontFamily: theme.typography.mono,
  },
  slider: {
    flex: 1,
    height: "4px",
    borderRadius: "2px",
    outline: "none",
    appearance: "none",
    background: theme.colors.panelBorder,
  },
  value: {
    fontSize: theme.typography.sizeSM,
    fontWeight: theme.typography.weightSemibold,
    minWidth: "1.5rem",
    textAlign: "right",
    fontFamily: theme.typography.mono,
    color: theme.colors.accent,
  },
  info: {
    marginTop: theme.layout.gapSmall,
    fontSize: theme.typography.sizeXS,
    color: theme.colors.textDim,
    lineHeight: 1.4,
  },
  toggleButton: {
    width: "100%",
    padding: "0.5rem",
    fontSize: theme.typography.sizeXS,
    fontWeight: theme.typography.weightSemibold,
    borderRadius: theme.layout.buttonRadius,
    border: `1px solid ${theme.colors.inputBorder}`,
    cursor: "pointer",
    transition: theme.effects.transitionNormal,
    marginTop: theme.layout.gapSmall,
  },
  toggleButtonAnimating: {
    backgroundColor: theme.colors.buttonPrimary,
    color: theme.colors.buttonPrimaryText,
  },
  toggleButtonPaused: {
    backgroundColor: theme.colors.buttonSecondary,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.layout.gapTiny,
    padding: "0.25rem 0.5rem",
    borderRadius: theme.layout.badgeRadius,
    fontSize: theme.typography.sizeXS,
    fontWeight: theme.typography.weightSemibold,
    marginLeft: "0.5rem",
  },
  statusAnimating: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    color: theme.colors.success,
  },
  statusPaused: {
    backgroundColor: "rgba(148, 163, 184, 0.2)",
    color: theme.colors.textMuted,
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
  animating,
  onAnimatingToggle,
}) => {
  const handleManualChange = (setter: (value: number) => void, value: number) => {
    // Pause animation when user manually adjusts
    if (animating) {
      onAnimatingToggle(false);
    }
    setter(value);
  };

  return (
    <div style={styles.container}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
        <h3 style={{ ...styles.title, margin: 0 }}>Quantum Field</h3>
        <span
          style={{
            ...styles.statusBadge,
            ...(animating ? styles.statusAnimating : styles.statusPaused),
          }}
        >
          {animating ? "◉ Live" : "◯ Paused"}
        </span>
      </div>
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
            onChange={(e) => handleManualChange(onNxChange, parseInt(e.target.value, 10))}
            style={styles.slider}
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
            onChange={(e) => handleManualChange(onNyChange, parseInt(e.target.value, 10))}
            style={styles.slider}
          />
          <span style={styles.value}>{ny}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAnimatingToggle(!animating)}
        style={{
          ...styles.toggleButton,
          ...(animating ? styles.toggleButtonAnimating : styles.toggleButtonPaused),
        }}
      >
        {animating ? "⏸ Pause Field Evolution" : "▶ Resume Field Evolution"}
      </button>
      <p style={styles.info}>
        Eigenstate ψ<sub>{nx},{ny}</sub>(x,y) · Energy: {nx + ny + 1}ℏω
        {animating && " · Evolving through parameter space"}
      </p>
    </div>
  );
};

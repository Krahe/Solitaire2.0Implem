import React from "react";

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
    bottom: "1.5rem",
    right: "1.5rem",
    backgroundColor: "rgba(11, 17, 32, 0.95)",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1rem",
    color: "#e2e8f0",
    zIndex: 100,
    minWidth: "240px",
    backdropFilter: "blur(8px)",
  },
  title: {
    margin: 0,
    fontSize: "0.9rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
    color: "#94a3b8",
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
    fontFamily: "Fira Code, Source Code Pro, Menlo, monospace",
  },
  slider: {
    flex: 1,
    height: "4px",
    borderRadius: "2px",
    outline: "none",
    appearance: "none",
    background: "#1e293b",
  },
  value: {
    fontSize: "0.85rem",
    fontWeight: 600,
    minWidth: "1.5rem",
    textAlign: "right",
    fontFamily: "Fira Code, Source Code Pro, Menlo, monospace",
    color: "#38bdf8",
  },
  info: {
    marginTop: "0.75rem",
    fontSize: "0.75rem",
    color: "#64748b",
    lineHeight: 1.4,
  },
  toggleButton: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    borderRadius: "0.5rem",
    border: "1px solid #334155",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "0.75rem",
  },
  toggleButtonAnimating: {
    backgroundColor: "#22c55e",
    color: "#04111f",
  },
  toggleButtonPaused: {
    backgroundColor: "#1e293b",
    color: "#94a3b8",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "999px",
    fontSize: "0.7rem",
    fontWeight: 600,
    marginLeft: "0.5rem",
  },
  statusAnimating: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    color: "#22c55e",
  },
  statusPaused: {
    backgroundColor: "rgba(148, 163, 184, 0.2)",
    color: "#94a3b8",
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

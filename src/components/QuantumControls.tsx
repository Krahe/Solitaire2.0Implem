import React from "react";

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
            onChange={(e) => onNyChange(parseInt(e.target.value, 10))}
            style={styles.slider}
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

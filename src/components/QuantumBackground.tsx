import React from "react";
import { generateQuantumGrid } from "../logic/quantumHarmonicOscillator";

export interface QuantumBackgroundProps {
  nx?: number;
  ny?: number;
  opacity?: number;
  gridSize?: number;
}

/**
 * Renders a quantum harmonic oscillator wavefunction probability density
 * as an animated canvas background.
 */
export const QuantumBackground: React.FC<QuantumBackgroundProps> = ({
  nx = 2,
  ny = 2,
  opacity = 0.15,
  gridSize = 120,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set canvas size to match display size
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();

    // Generate quantum wavefunction grid
    const grid = generateQuantumGrid(nx, ny, gridSize);

    // Render heatmap
    const render = () => {
      const rect = canvas.getBoundingClientRect();

      // First, draw the radial gradient background
      const gradient = ctx.createRadialGradient(
        rect.width / 2,
        0,
        0,
        rect.width / 2,
        0,
        rect.height * 0.6
      );
      gradient.addColorStop(0, "#1e293b"); // slate-800
      gradient.addColorStop(1, "#020617"); // slate-950

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      const cellWidth = rect.width / grid.width;
      const cellHeight = rect.height / grid.height;

      // Normalize to probability density |ψ|²
      const probabilityGrid = grid.values.map(row =>
        row.map(val => val * val)
      );

      // Find max probability for normalization
      let maxProb = 0;
      for (const row of probabilityGrid) {
        for (const prob of row) {
          maxProb = Math.max(maxProb, prob);
        }
      }

      // Render each cell
      for (let i = 0; i < grid.height; i++) {
        for (let j = 0; j < grid.width; j++) {
          const probability = probabilityGrid[i][j];
          const intensity = maxProb > 0 ? probability / maxProb : 0;

          // Color scheme: deep blue to cyan/indigo gradient
          // Low intensity: darker tones
          // High intensity: #38bdf8 (sky-400) with hints of #818cf8 (indigo-400)
          const r = Math.floor(30 + intensity * (129 - 30));  // 30 -> 129 (indigo)
          const g = Math.floor(41 + intensity * (189 - 41));  // 41 -> 189 (cyan)
          const b = Math.floor(59 + intensity * (248 - 59));  // 59 -> 248 (bright)

          const alpha = opacity * (0.4 + 0.6 * intensity);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillRect(
            j * cellWidth,
            i * cellHeight,
            cellWidth + 1, // +1 to avoid gaps
            cellHeight + 1
          );
        }
      }
    };

    render();

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize();
      render();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nx, ny, opacity, gridSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

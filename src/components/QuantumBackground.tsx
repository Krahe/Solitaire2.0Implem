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
  const startTimeRef = React.useRef<number>(performance.now());

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

    // Pre-compute probability grid once
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

    // Animated render with mysterious pulsing glow
    const render = (currentTime: number) => {
      const rect = canvas.getBoundingClientRect();

      // Pulsing effect: slow sine wave (6 second period)
      const elapsed = (currentTime - startTimeRef.current) / 1000;
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * Math.PI / 3); // 0 to 1, 6s period

      // Secondary slower pulse for depth (10 second period)
      const deepPulse = 0.5 + 0.5 * Math.sin(elapsed * Math.PI / 5);

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

      // Render each cell with pulsing glow
      for (let i = 0; i < grid.height; i++) {
        for (let j = 0; j < grid.width; j++) {
          const probability = probabilityGrid[i][j];
          const intensity = maxProb > 0 ? probability / maxProb : 0;

          // Pulsing brightness: brighten high-intensity areas more during pulse
          const pulseBoost = 1.0 + (pulse * 0.3 * intensity); // Up to 30% brighter at peaks

          // Color scheme: deep blue to cyan/indigo gradient with pulsing
          const r = Math.floor((30 + intensity * (129 - 30)) * pulseBoost);
          const g = Math.floor((41 + intensity * (189 - 41)) * pulseBoost);
          const b = Math.floor((59 + intensity * (248 - 59)) * pulseBoost);

          // Pulsing opacity: breath between base opacity and enhanced
          const baseAlpha = opacity * (0.4 + 0.6 * intensity);
          const pulsedAlpha = baseAlpha * (1.0 + deepPulse * 0.2); // Up to 20% more opaque

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulsedAlpha})`;
          ctx.fillRect(
            j * cellWidth,
            i * cellHeight,
            cellWidth + 1, // +1 to avoid gaps
            cellHeight + 1
          );
        }
      }

      // Add subtle glow overlay at pulse peaks
      if (pulse > 0.7) {
        const glowStrength = (pulse - 0.7) / 0.3; // 0 to 1 as pulse goes 0.7 to 1.0
        ctx.fillStyle = `rgba(56, 189, 248, ${glowStrength * 0.05})`; // Very subtle cyan glow
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize();
      // Animation loop will handle re-rendering
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

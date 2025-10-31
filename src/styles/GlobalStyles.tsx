import React from "react";
import { theme } from "./theme";

/**
 * Global styles for focus states and accessibility
 * Injects beautiful focus rings for keyboard navigation
 */
export const GlobalStyles: React.FC = () => {
  React.useEffect(() => {
    // Create style element
    const styleEl = document.createElement("style");
    styleEl.id = "global-focus-styles";

    // Define focus styles
    styleEl.textContent = `
      /* Beautiful focus rings for keyboard navigation */
      button:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      select:focus-visible,
      details:focus-visible,
      summary:focus-visible {
        outline: none;
        box-shadow: ${theme.effects.focusRingGlow};
        transition: box-shadow ${theme.effects.transitionFast};
      }

      /* Slightly different focus for inputs (less glow, more ring) */
      input:focus-visible,
      textarea:focus-visible {
        box-shadow: ${theme.effects.focusRing};
      }

      /* Remove default focus outline */
      *:focus {
        outline: none;
      }

      /* Ensure focus-visible works (not focus on click, only on keyboard) */
      *:focus:not(:focus-visible) {
        outline: none;
        box-shadow: none;
      }

      /* Mysterious pulsing glow for panels */
      @keyframes quantumPulse {
        0%, 100% {
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.3),
            0 2px 4px -1px rgba(0, 0, 0, 0.2),
            0 0 0 1px ${theme.colors.panelBorder},
            0 0 20px rgba(56, 189, 248, 0.0);
        }
        50% {
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.3),
            0 2px 4px -1px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(56, 189, 248, 0.3),
            0 0 25px rgba(56, 189, 248, 0.15);
        }
      }

      section {
        animation: quantumPulse 6s ease-in-out infinite;
      }

      /* Quantum controls panel gets a slightly faster pulse */
      [data-quantum-controls="true"] {
        animation: quantumPulse 4s ease-in-out infinite;
      }
    `;

    document.head.appendChild(styleEl);

    return () => {
      // Cleanup on unmount
      const el = document.getElementById("global-focus-styles");
      if (el) {
        el.remove();
      }
    };
  }, []);

  return null;
};

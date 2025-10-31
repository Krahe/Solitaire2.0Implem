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

      /* Responsive grid layout */
      .app-grid {
        grid-template-columns: 1fr; /* Mobile: single column */
      }

      @media (min-width: 1100px) {
        .app-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)); /* Desktop: 3 columns */
        }

        /* Column assignments on desktop */
        .grid-header {
          grid-column: 1 / -1; /* Header spans all columns */
        }

        .grid-plaintext {
          grid-column: 1;
          grid-row: 2;
        }

        .grid-cipher {
          grid-column: 1;
          grid-row: 3;
        }

        .grid-deck-input {
          grid-column: 2;
          grid-row: 2 / span 2; /* Deck input spans 2 rows */
        }

        .grid-deck-preview {
          grid-column: 3;
          grid-row: 2;
        }

        .grid-quantum {
          grid-column: 3;
          grid-row: 3;
        }
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

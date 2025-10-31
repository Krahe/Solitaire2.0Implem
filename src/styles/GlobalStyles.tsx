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

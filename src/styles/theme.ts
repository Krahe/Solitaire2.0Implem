/**
 * Centralized theme tokens for Solitaire Cipher Playground
 * "Atlantean field gear" aesthetic: quantum foam + operator panels
 */

export const theme = {
  colors: {
    // Panels
    panelBg: 'rgba(11, 17, 32, 0.95)',
    panelBgSecondary: 'rgba(15, 23, 42, 0.9)',
    panelBorder: '#1e293b',
    panelShadow: 'rgba(0, 0, 0, 0.3)',

    // Text hierarchy
    textPrimary: '#e2e8f0',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textDim: '#64748b',

    // Semantic colors
    accent: '#38bdf8',        // sky-400 (quantum cyan)
    accentBright: '#0ea5e9',  // sky-500
    success: '#22c55e',       // green-500
    warning: '#f97316',       // orange-500
    error: '#f87171',         // red-400

    // Interactive
    buttonPrimary: '#22c55e',
    buttonPrimaryText: '#04111f',
    buttonSecondary: '#1e293b',
    buttonSecondaryText: '#e2e8f0',

    // Inputs
    inputBg: '#020617',
    inputBorder: '#334155',
    inputFocus: '#38bdf8',

    // Background (solid fallback)
    appBgSolid: '#020617',
  },

  layout: {
    // Spacing
    panelPadding: '1.25rem',
    gapBetweenPanels: '1.5rem',
    gapSmall: '0.75rem',
    gapTiny: '0.35rem',

    // Borders
    panelRadius: '12px',
    buttonRadius: '0.65rem',
    badgeRadius: '999px',

    // Widths
    maxContentWidth: '1080px',
    panelMinWidth: '240px',

    // Heights
    minTouchTarget: '44px',
  },

  typography: {
    // Font stacks
    mono: 'Fira Code, Source Code Pro, Menlo, Consolas, monospace',
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

    // Sizes
    sizeXL: '2rem',
    sizeLG: '1.25rem',
    sizeMD: '0.95rem',
    sizeSM: '0.85rem',
    sizeXS: '0.75rem',

    // Weights
    weightNormal: 400,
    weightMedium: 500,
    weightSemibold: 600,
    weightBold: 700,
  },

  effects: {
    // Transitions
    transitionFast: '0.15s ease',
    transitionNormal: '0.2s ease',
    transitionSlow: '0.3s ease',

    // Shadows
    shadowPanel: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    shadowGlow: '0 0 20px rgba(56, 189, 248, 0.15)',

    // Backdrop
    backdropBlur: 'blur(8px)',
  },
} as const;

export type Theme = typeof theme;

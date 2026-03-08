export const CONSTANTS = {
  // Block dimensions
  blockHeight: 0.6,
  propositionWidth: 0.8,
  operatorExtendedWidth: 1.6,
  
  // Layout constants
  layoutSpacing: 0.8,
  layoutOffset: 0.5,
  
  // Text styling
  textFontSize: 48,
  textPadding: 8,
  
  // Time animation
  timeStepDuration: 1000,
  
  // Three.js dimensions
  zIndex: 0,
  zOffset: 0,
};

export const COLORS = {
  // Satisfaction colors (green/blue palette)
  satisfied: {
    PROPOSITION: '#4ade80',
    ALWAYS: '#60a5fa',
    EVENTUALLY: '#34d399',
    NEXT: '#fb923c',
    NOT: '#fca5a5',
    AND: '#fbbf24',
    OR: '#a78bfa',
    UNTIL: '#22d3ee',
    DEFAULT: '#e5e7eb',
  },
  
  // Unsatisfied colors (red/orange palette)
  unsatisfied: {
    PROPOSITION: '#e63946',
    ALWAYS: '#457b9d',
    EVENTUALLY: '#52b788',
    NEXT: '#f4a261',
    NOT: '#f87171',
    AND: '#f59e0b',
    OR: '#8b5cf6',
    UNTIL: '#06b6d4',
    DEFAULT: '#adb5bd',
  },
  
  // Text colors
  text: {
    fill: 'white',
  },
};

export const OPERATOR_SYMBOLS = {
  PROPOSITION: (variableId?: string) => variableId || 'p',
  ALWAYS: '□',
  EVENTUALLY: '◇',
  NEXT: '○',
  NOT: '¬',
  AND: '∧',
  OR: '∨',
  UNTIL: '𝒰',
};

export const MAX_BUNDLE_SIZE = 500 * 1024; // 500 kB in bytes
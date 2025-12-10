/**
 * Shared style constants for consistent design across the app
 */

export const BORDER_STYLES = {
  // Standard border
  base: "border border-stone-200 hover:border-stone-300",

  // Border with hover effect
  interactive: "border border-stone-200 hover:border-stone-300",

  // Common input styling
  input: "border border-stone-300 focus:outline-none focus:ring-1 focus:ring-blue-400",
} as const;

export const BUTTON_STYLES = {
  // Standard button with shadow
  base: "border border-stone-200 shadow-xs hover:border-stone-300",
} as const;

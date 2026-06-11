/**
 * Returns true if a hex color is "light" (luminance > 0.35).
 * Use this to decide whether to put black or white text on a colored background.
 */
export function isLight(hex) {
  if (!hex || !hex.startsWith('#')) return true;
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return true;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  // Relative luminance (WCAG formula)
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.35;
}

/**
 * Returns '#000000' or '#ffffff' — whichever has better contrast against the given hex bg.
 */
export function contrastText(hex) {
  return isLight(hex) ? '#000000' : '#ffffff';
}

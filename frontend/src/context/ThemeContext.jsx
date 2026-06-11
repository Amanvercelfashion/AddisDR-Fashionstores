import { createContext, useContext, useEffect } from 'react';
import { useBusiness } from './BusinessContext';
import { contrastText } from '../utils/colorContrast';

const ThemeContext = createContext(null);

const DEFAULTS = {
  primary:   '#2563eb',
  secondary: '#7c3aed',
  tertiary:  '#0891b2',
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function ThemeProvider({ children }) {
  const { business } = useBusiness();

  const primary   = business?.color_primary   || DEFAULTS.primary;
  const secondary = business?.color_secondary || DEFAULTS.secondary;
  const tertiary  = business?.color_tertiary  || DEFAULTS.tertiary;

  // Auto-contrast text for each color
  const onPrimary   = contrastText(primary);
  const onSecondary = contrastText(secondary);
  const onTertiary  = contrastText(tertiary);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary',        primary);
    root.style.setProperty('--color-secondary',      secondary);
    root.style.setProperty('--color-tertiary',       tertiary);
    root.style.setProperty('--color-primary-rgb',    hexToRgb(primary));
    root.style.setProperty('--color-secondary-rgb',  hexToRgb(secondary));
    root.style.setProperty('--color-tertiary-rgb',   hexToRgb(tertiary));
    // Contrast text colors as CSS vars too
    root.style.setProperty('--on-primary',   onPrimary);
    root.style.setProperty('--on-secondary', onSecondary);
    root.style.setProperty('--on-tertiary',  onTertiary);
    // RGB versions for rgba() usage
    const toRgb = (hex) => {
      const c = hex.replace('#', '');
      return `${parseInt(c.slice(0,2),16)} ${parseInt(c.slice(2,4),16)} ${parseInt(c.slice(4,6),16)}`;
    };
    root.style.setProperty('--on-primary-rgb',   toRgb(onPrimary));
    root.style.setProperty('--on-secondary-rgb', toRgb(onSecondary));
    root.style.setProperty('--on-tertiary-rgb',  toRgb(onTertiary));

    return () => {
      root.style.setProperty('--color-primary',   DEFAULTS.primary);
      root.style.setProperty('--color-secondary', DEFAULTS.secondary);
      root.style.setProperty('--color-tertiary',  DEFAULTS.tertiary);
      root.style.setProperty('--on-primary',   '#ffffff');
      root.style.setProperty('--on-secondary', '#ffffff');
      root.style.setProperty('--on-tertiary',  '#ffffff');
    };
  }, [primary, secondary, tertiary, onPrimary, onSecondary, onTertiary]);

  return (
    <ThemeContext.Provider value={{ primary, secondary, tertiary, onPrimary, onSecondary, onTertiary }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}

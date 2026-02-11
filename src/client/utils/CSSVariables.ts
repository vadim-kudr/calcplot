/**
 * CSS Variables Manager - dynamically sets CSS variables from constants
 */

import { CALCPLOT_COLORS } from '../../visualization/plots/constants';
import { DEFAULT_CONFIG } from '../../lib/config/defaults';

/**
 * Set calcplot color CSS variables dynamically
 */
export function setColorCSSVariables(): void {
  const root = document.documentElement;
  
  CALCPLOT_COLORS.forEach((color, index) => {
    root.style.setProperty(`--calcplot-color-${index}`, color);
  });
}

/**
 * Set layout CSS variables from default config
 */
export function setLayoutCSSVariables(): void {
  const root = document.documentElement;
  
  root.style.setProperty('--calcplot-min-width', `${DEFAULT_CONFIG.WIDTH}px`);
  root.style.setProperty('--calcplot-min-height', `${DEFAULT_CONFIG.HEIGHT}px`);
  root.style.setProperty('--calcplot-mobile-breakpoint', `${DEFAULT_CONFIG.MOBILE_BREAKPOINT}px`);
  root.style.setProperty('--calcplot-mobile-view-height', `${DEFAULT_CONFIG.MOBILE_VIEW_HEIGHT}px`);
}

/**
 * Initialize all calcplot CSS variables
 */
export function initializeCSSVariables(): void {
  setColorCSSVariables();
  setLayoutCSSVariables();
}

/**
 * Get CSS variable value for color
 */
export function getColorCSSVariable(index: number): string {
  return `var(--calcplot-color-${index})`;
}

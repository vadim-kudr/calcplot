/**
 * Default configuration constants for CalcPlot
 * Centralized place for all default values
 */

export const DEFAULT_CONFIG = {
  /** Default width for visualizations (auto to fit content) */
  WIDTH: 'auto' as const,
  
  /** Default height for visualizations */
  HEIGHT: 480,
  
  /** Default time range for simulations */
  TIME_RANGE: [0, 10] as [number, number],
  
  /** Default time step for numerical integration */
  TIME_STEP: 0.01,
  
  /** Default debounce time for resize events (ms) */
  RESIZE_DEBOUNCE: 16,
  
  /** Default gap between views in multi-view layout (px) */
  VIEW_GAP: 10,
  
  /** Minimum view height as fraction of default */
  MIN_HEIGHT_RATIO: 0.5,
  
  /** Maximum view height as fraction of default */
  MAX_HEIGHT_RATIO: 1.5,
  
  /** Default container width when not specified (px) */
  DEFAULT_CONTAINER_WIDTH: 800,
  
  /** Mobile breakpoint width (px) */
  MOBILE_BREAKPOINT: 600,
  
  /** Mobile view height for multiple views (px) */
  MOBILE_VIEW_HEIGHT: 400,
  
  /** Grid gap between view items (px) */
  GRID_GAP: 15
} as const;

export type DefaultConfig = typeof DEFAULT_CONFIG;

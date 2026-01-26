/**
 * CalcPlot - Interactive Calculation and Plotting Library
 */

// Core exports
export { defineIVP } from './core/ivp';
export { simulate } from './core/simulate';
export { Timeline } from './core/timeline';

// NEW: Declarative API exports
export { compare, explore, show } from './api';

// Simple API exports (LAYOUT.md style)
export { axis, canvas, grid, plot, scene } from './ui/SimpleViewBuilder';

// UI exports
export { checkbox, slider } from './ui/controls';
export { view, ViewBuilder } from './ui/ViewBuilder';

// Re-export types for convenience
export type {
  Derivatives,
  Event,
  Events,
  Model,
  Params,
  SimulationOptions,
  State,
  Timeline as TimelineInterface
} from './core/ivp';

export type {
  DrawContext,
  GridOptions,
  Layer,
  PlotOptions,
  SceneFunction,
  SelectorFunction,
  VectorFunction,
  VectorOptions
} from './ui/ViewBuilder';

export type { Control } from './ui/controls';

// Utils
export { detectEnvironment, isDenoJupyter, supportsHTMLOutput } from './utils/environment';

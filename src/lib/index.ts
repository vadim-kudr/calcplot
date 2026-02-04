/**
 * CalcPlot - Interactive Calculation and Plotting Library
 */

// Core exports
export { defineIVP } from '../core/ivp';
export { simulate } from '../core/simulate';
export { Timeline } from '../core/timeline';

// Declarative API exports
export { compare } from './compare';
export { explore } from './explore';
export { show } from './show';

// Simple API exports 
export { axis, canvas, grid, plot, scene } from './builders/SimpleViewBuilder';

// UI exports
export { view, ViewBuilder } from './builders/ViewBuilder';

export { checkbox, slider } from './controls';

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
} from '../core/ivp';

export type {
  DrawContext,
  GridOptions,
  Layer,
  PlotOptions,
  SceneFunction,
  SelectorFunction,
  VectorFunction,
  VectorOptions,
} from './builders/ViewBuilder';

export type { Control } from './controls';

// Utils
export { detectEnvironment, isDenoJupyter, supportsHTMLOutput } from './utils/environment';

/**
 * CalcPlot - Interactive Calculation and Plotting Library
 */

// Core exports
export { defineIVP } from '../core/defineIVP';
export { simulate } from '../core/simulate';
export { Timeline } from '../core/timeline';

// Declarative API exports
export { compare } from './api/compare';
export { explore } from './api/explore';
export { show } from './api/show';
export { setDefaultTarget, getDefaultTarget, clearDefaultTarget, getTargetWithFallback } from './api/defaultTarget';

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
} from '../core/types';

export type {
  DrawContext,
  SelectorFunction,
  SelectorResult,
  VectorFunction
} from './builders/BuilderInterfaces';

export type { Layer } from '../visualization/plots/interfaces';

export type {
  PlotOptions,
  AxisOptions,
  GridOptions,
  VectorOptions,
  FillOptions,
  RefLineOptions,
  LegendOptions,
  TitleOptions,
  VectorFieldOptions,
  NullclineOptions,
  PoincareOptions,
  SceneOptions
} from '../visualization/plots/interfaces';

export { parsePlotArgs, parseAxisArgs } from './builders/BuilderUtils';

export type { Control } from './controls';

export type { AnyDescriptor } from './types';

// Utils
export { detectEnvironment, isDenoJupyter, supportsHTMLOutput } from './utils/environment';

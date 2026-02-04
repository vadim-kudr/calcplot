/**
 * Declarative API for CalcPlot
 * Main entry point for show, explore, compare functions
 */

// Re-export all API functions
export { compare } from './compare';
export { explore } from './explore';
export { show } from './show';

// Re-export core types needed for the API
export type { Model, Params, State, Timeline } from '../core/ivp';
export type { Control, SliderControl, CheckboxControl } from '../ui/controls';
export type { 
  ViewBuilder, 
  PlotOptions, 
  FillOptions, 
  RefLineOptions, 
  LegendOptions, 
  VectorFieldOptions, 
  NullclineOptions,
  PoincareOptions,
  GridOptions,
  VectorOptions,
  SceneFunction,
  SelectorFunction,
  VectorFunction,
  DrawContext,
  Layer
} from '../ui/ViewBuilder';

// Re-export API function types
export type { ExploreConfig, ExploreOptions } from './explore';
export type { ShowOptions } from './show';
export type { CompareConfig, CompareOptions } from './compare';
export type { SimulateConfig } from '../core/simulate';

// Re-export core functions
export { defineIVP } from '../core/ivp';
export { simulate } from '../core/simulate';
export { slider } from '../ui/controls';
export { view } from '../ui/ViewBuilder';

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
export type { Control } from '../ui/controls';

// Re-export core functions
export { defineIVP } from '../core/ivp';
export { simulate } from '../core/simulate';
export { slider } from '../ui/controls';
export { view } from '../ui/ViewBuilder';

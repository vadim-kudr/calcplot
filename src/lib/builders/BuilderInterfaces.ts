/**
 * Shared interfaces for CalcPlot builders
 */

import { State, Params } from '../../core/types';

export type SelectorResult = number | [number, number];

// Function interfaces
export interface SceneFunction {
  (ctx: DrawContext, state: State): void;
}

export interface SelectorFunction {
  (state: State): SelectorResult;
  (state: State, params: Params): SelectorResult;
}

export interface VectorFunction {
  (state: State): [number, number];
  (state: State, params: Params): [number, number];
}

export interface DrawContext {
  line: (
    from: [number, number],
    to: [number, number],
    options?: { width?: number; color?: string; dash?: number[] }
  ) => void;
  circle: (
    center: [number, number],
    radius: number,
    options?: { fill?: string; stroke?: string; width?: number }
  ) => void;
  arrow: (
    from: [number, number],
    to: [number, number],
    options?: { width?: number; color?: string; headSize?: number }
  ) => void;
  text: (
    pos: [number, number],
    text: string,
    options?: { color?: string; size?: number; font?: string }
  ) => void;
  plot: (xValues: number[], yValues: number[], options?: any) => void;
}

// Layer interfaces for ViewBuilder
export interface SceneLayer {
  type: 'scene';
  draw?: string; // serialized function body - params extracted by caching system
  index?: number;
  options?: any;
}
